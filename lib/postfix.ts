// Postfix (Reverse Polish) expression support for derived-feature formulas.
// A formula is built by the admin as: operands first (feature refs or constants),
// then operators last — e.g. ["Load", "9.81", "×", "Diameter", "÷"]
// which reads as: (Load * 9.81) / Diameter

export type PostfixOperator = "+" | "-" | "×" | "÷" | "^" | "%"

export const POSTFIX_OPERATORS: PostfixOperator[] = ["+", "-", "×", "÷", "^", "%"]

export type PostfixToken =
  | { type: "feature"; featureId: string; label: string }
  | { type: "constant"; value: number }
  | { type: "operator"; op: PostfixOperator }

export function tokenLabel(token: PostfixToken): string {
  if (token.type === "feature") return token.label
  if (token.type === "constant") return String(token.value)
  return token.op
}

export function isValidPostfix(tokens: PostfixToken[]): boolean {
  if (tokens.length === 0) return false
  let stack = 0
  for (const t of tokens) {
    if (t.type === "operator") {
      stack -= 1
      if (stack < 1) return false
    } else {
      stack += 1
    }
  }
  return stack === 1
}

function applyOp(op: PostfixOperator, a: number, b: number): number {
  switch (op) {
    case "+":
      return a + b
    case "-":
      return a - b
    case "×":
      return a * b
    case "÷":
      return b === 0 ? 0 : a / b
    case "^":
      return Math.pow(a, b)
    case "%":
      return b === 0 ? 0 : a % b
  }
}

/**
 * Evaluates a postfix token list against a map of current feature values.
 * Returns null if a required feature value is missing/NaN.
 */
export function evaluatePostfix(tokens: PostfixToken[], values: Record<string, number | null | undefined>): number | null {
  const stack: number[] = []
  for (const t of tokens) {
    if (t.type === "constant") {
      stack.push(t.value)
    } else if (t.type === "feature") {
      const v = values[t.featureId]
      if (v === null || v === undefined || Number.isNaN(v)) return null
      stack.push(v)
    } else {
      const b = stack.pop()
      const a = stack.pop()
      if (a === undefined || b === undefined) return null
      stack.push(applyOp(t.op, a, b))
    }
  }
  return stack.length === 1 ? stack[0] : null
}

export function formatPostfixExpression(tokens: PostfixToken[]): string {
  return tokens.map(tokenLabel).join("  ")
}
