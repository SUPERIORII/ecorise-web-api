// import axios from "axios";
const COHERE_API_KEY = process.env.COHERE_API_KEY;

// GENERATE A CATCHLY TITLE
export const generateHeadline = async (description) => {
  // CHECK IF DESCRIPTION IS EMPTY
  if (!description) return "";

  // Only use Cohere API for headline generation

  // STEP 1: MAKE API CALL TO COHERE API FOR HEADLINE GENERATION

  // try {
  //   const cohereResponse = await fetch(
  //     "https://api.cohere.ai/v1/chat",
  //     {method:"POST",},
  //     {
  //       message: `Generate a short, catchy, SEO-friendly title for this content:\n${description}`,
  //       temperature: 0.7,
  //     },
  //     {
  //       headers: {
  //         Authorization: `Bearer ${COHERE_API_KEY}`,
  //         "Content-Type": "application/json",
  //       },
  //     }
  //   );

  //   console.log({ cohereResponse: cohereResponse.data });

  //   if (cohereResponse.data?.text) {
  //     return `${cohereResponse.data.text.trim().replace(`**""`, "")}...`;
  //   }
  // } catch (error) {
  //   console.warn("Cohere api failed:", error.message, error.response?.data);
  // }

  // STEP 3: IF THEY ALL FAILS THE USE THE FALLBACK

  // REMOVE PUNCTUATION AND WHITE SPACE FROM THE DESCRIPTION
  const newDescription = description.replace(/[^\w\s]/g, "").split(/\s+/);
  const headline = newDescription.join(" ");

  // RETURN 'DESCRIPTION' + '...' IF THE HEADLINE IS GREATER THAN 30 OR THE 'DESCRIPTION' IF IT IS LESS
  headline.length > 30
    ? console.log(`${headline.slice(0, 60)}...`)
    : console.log(headline);
  return headline.length > 30 ? `${headline.slice(0, 60)}...` : headline;
};
