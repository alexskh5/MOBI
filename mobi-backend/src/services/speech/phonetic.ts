function normalizeForChildSpeech(word: string): string {
  return word
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .replace(/^k/, "c")
    .replace(/^ph/, "f")
    .replace(/^q/, "c");
}

function soundex(word: string): string {
  const clean = normalizeForChildSpeech(word);

  if (!clean) return "";

  const firstLetter = clean[0].toUpperCase();

  const codes: Record<string, string> = {
    b: "1", f: "1", p: "1", v: "1",
    c: "2", g: "2", j: "2", k: "2", q: "2", s: "2", x: "2", z: "2",
    d: "3", t: "3",
    l: "4",
    m: "5", n: "5",
    r: "6",
  };

  let result = firstLetter;
  let previousCode = codes[clean[0]] || "";

  for (let i = 1; i < clean.length; i++) {
    const code = codes[clean[i]] || "";

    if (code && code !== previousCode) {
      result += code;
    }

    previousCode = code;
  }

  return (result + "000").slice(0, 4);
}

export function phoneticMatch(a: string, b: string): boolean {
  return soundex(a) !== "" && soundex(a) === soundex(b);
}