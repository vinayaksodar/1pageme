import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { TextNode, Mark } from '@/types/resume'
import { escape } from 'lodash'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function emptyTextNodes(): TextNode[] {
  return [{ type: 'text', text: '' }]
}

export function textNodesToString(nodes: TextNode[]): string {
  if (!nodes) return ''
  return nodes.map((n) => n.text).join('')
}

export function textNodesToHtml(
  nodes: TextNode[] | string | undefined,
): string {
  if (!nodes) return ''
  if (typeof nodes === 'string') {
    // If it's a plain string, just escape it and return.
    return escape(nodes)
  }
  if (!Array.isArray(nodes)) return ''

  return nodes
    .map((node) => {
      let children = escape(node.text)
      if (node.marks) {
        // Order of wrapping is important for proper nesting
        const orderedMarks: Mark[] = [
          ...(
            node.marks.filter((m) => typeof m === 'string') as string[]
          ).sort(),
          ...node.marks.filter((m) => typeof m === 'object'),
        ]

        orderedMarks.forEach((mark) => {
          if (typeof mark === 'string') {
            switch (mark) {
              case 'bold':
                children = `<strong>${children}</strong>`
                break
              case 'italic':
                children = `<em>${children}</em>`
                break
              case 'underline':
                children = `<u>${children}</u>`
                break
              case 'strikethrough':
                children = `<s>${children}</s>`
                break
            }
          } else if (mark.type === 'link') {
            children = `<a href="${escape(mark.attrs.href)}">${children}</a>`
          }
        })
      }
      return children
    })
    .join('')
}

export function htmlToTextNodes(html: string): TextNode[] {
  if (typeof window === 'undefined') {
    return [{ type: 'text', text: html }] // Fallback for SSR
  }

  // 1. Create a container and parse the HTML
  const el = document.createElement('div')
  el.innerHTML = html.replace(/<br>/g, '\n') // Normalize line breaks

  const nodes: TextNode[] = []

  // 2. Recursive traversal function
  function traverse(node: Node, activeMarks: Mark[] = []) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent) {
        nodes.push({ type: 'text', text: node.textContent, marks: activeMarks })
      }
      return
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return

    const element = node as HTMLElement
    const newMarks = [...activeMarks]
    const tagName = element.tagName.toLowerCase()

    // 3. Collect marks from the current element
    switch (tagName) {
      case 'strong':
      case 'b':
        newMarks.push('bold')
        break
      case 'em':
      case 'i':
        newMarks.push('italic')
        break
      case 'u':
        newMarks.push('underline')
        break
      case 's':
        newMarks.push('strikethrough')
        break
      case 'a':
        newMarks.push({
          type: 'link',
          attrs: { href: (element as HTMLAnchorElement).href },
        })
        break
    }

    // 4. Traverse child nodes
    element.childNodes.forEach((child) => traverse(child, newMarks))
  }

  traverse(el)

  // 5. Merge adjacent nodes with identical marks
  const mergedNodes: TextNode[] = []
  if (nodes.length > 0) {
    mergedNodes.push({ ...nodes[0] })

    for (let i = 1; i < nodes.length; i++) {
      const current = nodes[i]
      const last = mergedNodes[mergedNodes.length - 1]

      // Quick and dirty deep equality check for marks array
      const marksAreEqual =
        JSON.stringify(last.marks) === JSON.stringify(current.marks)

      if (marksAreEqual) {
        last.text += current.text
      } else {
        mergedNodes.push({ ...current })
      }
    }
  }

  if (mergedNodes.length === 0) {
    return emptyTextNodes()
  }

  return mergedNodes
}
