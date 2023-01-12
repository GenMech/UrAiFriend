import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import { Configuration, OpenAIApi } from "openai";

dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration); // creating instance of openAI by using openAIApi and by passing configuration

const app = express();
app.use(cors()); // for middleware
app.use(express.json()); // this will allow us to pass json from front-end to back-end

app.get("/", async (req, res) => {
  res.status(200).send({
    message: "Hello My Friend",
  });
});

app.post("/", async (req, res) => {
  try {
    const prompt = req.body.prompt;
    // console.log(prompt);

    const response = await openai.createCompletion({
      model: "text-davinci-003", // model will be of GPT-3, text-davinci-003
      prompt: `${prompt}`, // we are passing it from the front-end (Our textarea, that will contain the data for prompt)
      temperature: 0, // the more the temperature means the model will take more risks (default it was 0.7, but in our model we dont want it to take more risk and answer by what it knows, so assigning it 0)
      max_tokens: 3000, // The maximum number of token to generate in the completion.
      top_p: 1, // alternative to sampling with temperature, called nucleus sampling (Top-p sampling (or nucleus sampling) chooses from the smallest possible set of words whose cumulative probability exceeds the probability p)
      frequency_penalty: 0.5, // means it not going to repeat similar sentences often
      presence_penalty: 0, // makes model to talk about new topics
    });

    res.status(200).send({
      // after getting response, now send it back to front-end
      bot: response.data.choices[0].text,
    });
  } catch (error) {
    console.log(error);
    res.status(200).send({ error });
  }
});

app.listen(5000, () =>
  console.log("Server is running on port http://localhost:5000")
);
