// src/protocol/protocol.js

function s(v) {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}
function normToken(x) {
  return s(x).trim().toLowerCase();
}

export function isStrictRecipe(recipe) {
  return Boolean(recipe?.protocolStrict) === true;
}

export function assertAllStrict(recipes) {
  const list = Array.isArray(recipes) ? recipes : [];
  const bad = list.filter((r) => !isStrictRecipe(r));
  if (bad.length) {
    // fail loud in dev so you don't accidentally ship non-strict recipes
    throw new Error(
      `Protocol violation: found ${bad.length} non-strict recipes. Example: ${bad[0]?.id || "unknown"}`
    );
  }
  return true;
}

// Ingredient matching (works with your mixed ingredient formats)
function recipeIngredientTexts(recipe) {
  const ings = Array.isArray(recipe?.ingredients) ? recipe.ingredients : [];
  return ings
    .map((ing) => normToken(ing?.item || ing?.raw || ""))
    .filter(Boolean);
}

// userIngredients: ["apple", "cucumber", "leek"]
export function rankStrictRecipesByIngredients(recipes, userIngredients) {
  const list = Array.isArray(recipes) ? recipes : [];
  const tokens = (Array.isArray(userIngredients) ? userIngredients : [])
    .map(normToken)
    .filter(Boolean);

  return list
    .map((recipe) => {
      const texts = recipeIngredientTexts(recipe);
      let score = 0;
      const matched = [];

      for (const t of tokens) {
        const hit = texts.some((x) => x.includes(t)); // pragmatic for your legacy strings
        if (hit) {
          score += 1;
          matched.push(t);
        }
      }

      return { recipe, score, matched };
    })
    .sort((a, b) => b.score - a.score);
}
