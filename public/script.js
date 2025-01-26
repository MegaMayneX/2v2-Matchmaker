const socket = io("https://twov2-matchmaker-backend.onrender.com");

// Get references to DOM elements
const displayNameInput = document.getElementById("display-name");
const toggleAvailabilityButton = document.getElementById("toggle-availability");
const playersList = document.getElementById("players-list");
const chatInput = document.getElementById("chat-input");
const sendChatButton = document.getElementById("send-chat");
const chatMessages = document.getElementById("chat-messages");

let isAvailable = false; // Tracks the availability state of the player

// Handle the toggle availability button click
toggleAvailabilityButton.addEventListener("click", () => {
    const displayName = displayNameInput.value.trim();

    if (!displayName) {
        alert("Please enter your display name.");
        return;
    }

    isAvailable = !isAvailable; // Toggle availability state

    // Notify the server about the player's status
    socket.emit("toggleAvailability", { displayName, isAvailable });

    // Update the button text based on availability state
    toggleAvailabilityButton.textContent = isAvailable ? "Set Unavailable" : "Set Available";
});

// Listen for updates to the player list from the server
socket.on("updatePlayerList", (players) => {
    playersList.innerHTML = ""; // Clear the current list

    players.forEach(player => {
        const listItem = document.createElement("li");
        listItem.textContent = player.displayName;
        playersList.appendChild(listItem);
    });
});

// Handle the send chat button click
sendChatButton.addEventListener("click", () => {
    const message = chatInput.value.trim();
    const displayName = displayNameInput.value.trim();

    if (!message || !displayName) {
        alert("Please enter a message and set your display name.");
        return;
    }

    // Send the message to the server
    socket.emit("sendMessage", { displayName, message });

    // Clear the input field
    chatInput.value = "";
});

// Listen for incoming chat messages
socket.on("receiveMessage", (data) => {
    const { displayName, message, timestamp } = data;

    const messageElement = document.createElement("div");
    messageElement.innerHTML = `<strong>${timestamp} ${displayName}:</strong> ${message}`;

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom of the chat box
});
