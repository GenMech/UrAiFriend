import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadinterval;

function loader(element) {
  //function to set loading of 4 dots before AI gives answer
  element.textContent = "";

  loadinterval = setInterval(() => {
    element.textContent += ".";
    if (element.textContent === ".....") {
      element.textContent = "";
    }
  }, 300);
}

function typeText(element, text) {
  //function for word by word typing, when answer is given by AI
  let index = 0;
  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

function generateUniqueID() {
  // function to generate unique id for every message and it is necessary for typingText effect for sepecific replies, without this typingtext effect will happen on every text
  let timestamp = Date.now();
  let random = Math.random();
  let hexadecimalString = random.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueID) {
  // function to have dark and light stripes for chat by AI and user (And also diff logo)
  return `
    <div class = "wrapper ${isAi && "ai"}">
      <div class = "chat">
        <div class = "profile">
          <img
            src = "${isAi ? bot : user}"
            alt = "${isAi ? "bot" : "user"}"
          />
        </div>
        <div class = "message" id = ${uniqueID}>${value}</div>
      </div>
    </div>

    `;
}

// Now a submit function which get triggered to get AI generated messages
const handleSubmit = async (e) => {
  // e = event
  e.preventDefault();
  const data = new FormData(form);

  // User's ChatStripe
  chatContainer.innerHTML += chatStripe(false, data.get("textEntered"));
  form.reset(); // to clear the textarea after input

  // AI's ChatStripe
  const uniqueID = generateUniqueID();
  chatContainer.innerHTML += chatStripe(true, "", uniqueID);

  chatContainer.scrollTop = chatContainer.scrollHeight; // this will put the new message in view

  const messageDiv = document.getElementById(uniqueID);

  loader(messageDiv);

  // fetch data from server, Bot's response
  const response = await fetch("https://aifriendo.onrender.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.get("textEntered"), // this is the data or message coming from our textarea element on the screen
    }),
  });

  //after getting response, we want to clear the interval
  clearInterval(loadinterval);
  messageDiv.innerHTML = ""; // because we dont know at which point we are when we getting our reponse, for ex. at 2 dots, 3 dots etc
  if (response.ok) {
    const data = await response.json(); // this is giving us the actual response
    const parsedData = data.bot.trim(); // it will trim any trailing spaces '/n'

    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();
    messageDiv.innerHTML = "Something went out of box, try again brosk!";
    alert(err);
  }
};

form.addEventListener("submit", handleSubmit); // calling handleSubmit on submit buttom
form.addEventListener("keyup", (e) => {
  // calling handleSubmit on Enter key
  if (e.key === "Enter") {
    handleSubmit(e);
  }
});
