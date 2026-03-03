import { NextRequest, NextResponse } from "next/server";
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";
import { ResumeData } from "@/types/resume";

let cachedExecutablePath: string | null = null;

async function getBrowser() {
  const isProduction =
    !!process.env.VERCEL || process.env.NODE_ENV === "production";

  if (isProduction) {
    if (!cachedExecutablePath) {
      cachedExecutablePath = await chromium.executablePath(
        process.env.CHROMIUM_PACK_URL ||
          "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar",
      );
    }

    return puppeteer.launch({
      args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
      executablePath: cachedExecutablePath,
      headless: true,
    });
  } else {
    // Local development (macOS/Windows/Linux)
    // We attempt to find a local Chrome installation
    const localExecutablePath =
      process.platform === "darwin"
        ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
        : undefined; // Puppeteer-core will need an explicit path if not found

    return puppeteer.launch({
      args: ["--hide-scrollbars", "--disable-web-security"],
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
      executablePath: localExecutablePath,
      headless: true,
    });
  }
}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const resume = body.resume as ResumeData;

    if (!resume) {
      return NextResponse.json(
        { error: "Missing resume data" },
        { status: 400 },
      );
    }

    const browser = await getBrowser();
    const page = await browser.newPage();

    // Navigate to the print page first so we have the right origin
    const baseUrl = new URL(request.url).origin;
    const printUrl = `${baseUrl}/print`;

    // We navigate to the page first, then inject the data
    await page.goto(printUrl, {
      waitUntil: "networkidle0",
    });

    // Inject the resume data into the window
    await page.evaluate((data) => {
      window.__RESUME_DATA__ = data;
    }, resume);

    // Wait for our custom "ready" indicator
    await page.waitForSelector("#pdf-ready", { timeout: 10000 });

    // Explicitly wait for all fonts to be ready
    await page.evaluate(() => document.fonts.ready);

    // Additional wait for layout to stabilize after font load
    await new Promise((resolve) => setTimeout(resolve, 500));

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0mm",
        right: "0mm",
        bottom: "0mm",
        left: "0mm",
      },
    });

    await browser.close();

    const fileName = resume.title
      ? `${resume.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`
      : "resume.pdf";

    return new NextResponse(pdf as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("PDF generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 },
    );
  }
}
