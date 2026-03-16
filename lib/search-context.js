export function searchContext(question, chunks) {

  const words = question.toLowerCase().split(" ");

  const scored = chunks.map(chunk => {

    let score = 0;

    for (const word of words) {
      if (chunk.toLowerCase().includes(word)) {
        score++;
      }
    }

    return { chunk, score };

  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 6).map(c => c.chunk).join("\n\n");
}
