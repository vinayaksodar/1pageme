import { NextRequest, NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import puppeteer, { Browser } from "puppeteer-core";
import { ResumeData } from "@/types/resume";

// Reuse the browser instance between warm starts in production
let browser: Browser | null = null;

const viewport = {
  deviceScaleFactor: 1,
  hasTouch: false,
  height: 1080,
  isLandscape: true,
  isMobile: false,
  width: 1920,
};

async function getBrowser() {
  const isProduction = !!process.env.VERCEL;

  if (browser && browser.isConnected()) {
    return browser;
  }

  if (isProduction) {
    // If you don't need webGL, this skips the extraction of the bin/swiftshader.tar.br file, improving performance
    chromium.setGraphicsMode = false;

    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: viewport,
      executablePath: await chromium.executablePath(),
      headless: "shell",
    });
  } else {
    // Local development (macOS/Windows/Linux)
    // In local dev, we use 'channel: chrome' which auto-finds your browser
    browser = await puppeteer.launch({
      args: ["--hide-scrollbars", "--disable-web-security"],
      defaultViewport: viewport,
      // For Macs, this is generally cleaner than hardcoded paths
      ...(process.platform === "darwin" ? { channel: "chrome" } : {}),
      headless: true,
    });
  }

  return browser;
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

    const currentBrowser = await getBrowser();
    const page = await currentBrowser.newPage();

    try {
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

      const fileName = resume.title
        ? `${resume.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`
        : "resume.pdf";

      return new NextResponse(pdf as unknown as BodyInit, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${fileName}"`,
        },
      });
    } finally {
      // Always close the page to prevent memory leaks
      await page.close();

      // We don't want headless Chrome instances left running locally
      if (!process.env.VERCEL && currentBrowser.isConnected()) {
        await currentBrowser.close();
        browser = null;
      }
    }
  } catch (error) {
    console.error("PDF generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 },
    );
  }
}
