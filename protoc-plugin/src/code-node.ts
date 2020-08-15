// the simplest code node is just a single line
export type CodeLine = string;

// A code fragment is a collection of code nodes
export type CodeFrag = CodeNode[];

// Code is what most functions return
export type Code = CodeFrag | CodeLine;

// a code block is just an indented code node, you create it by using the indent() function
export type CodeBlock = {indent: CodeNode}

// a code node is a node in a hierarchy of indented code blocks
export type CodeNode = CodeBlock | Code;

export type Renderer = (node: CodeNode, indent?: number) => string;

export function indent(...contents: CodeNode[]) { return {indent: contents} };

export function createRenderer(indentStr: string = "    "): Renderer {
    const render: Renderer = (node, indent = 0) => {
        if (Array.isArray(node)) {
            // code fragment
            // return string at current indent
            return node.map(line => render(line, indent)).join("");
        }
        else if (typeof node === "object") {
            // code block
            // indent the specified amount and process code node
            return render(node.indent, indent + 1);
        }
        else {
            // string
            return node === "" ? "\n" : `${indentStr.repeat(indent)}${node}${"\n"}`
        }
    }
    return render;
}

