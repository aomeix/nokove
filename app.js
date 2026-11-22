const messages = document.querySelector(".messages");
const talkbox = document.querySelector(".talkbox");
messages.style.overflowAnchor = "none";
function addMessage(content, color) {
	const guest = color === -1;
	const msg = document.createElement("div");
	msg.className = guest ? "message frosty" : "message superfill";
	msg.textContent = content;
	if (!guest) msg.style.setProperty("--color", color);

	messages.prepend(msg);
	const cs = getComputedStyle(msg);
	const mt = parseFloat(cs.marginTop);
	const space = msg.offsetHeight + mt + parseFloat(cs.marginBottom);
	if (messages.scrollTop < -1) {
		messages.scrollTop -= space;
		return;
	}
	msg.animate([{ offset: 0, marginTop: `${mt - space}px`, opacity: 0 }], {
		duration: 400,
		easing: "cubic-bezier(0.34, 1.56, 0.64, 1)"
	});
}

let color = talkbox.style.getPropertyValue("--usercolor").trim();
Object.defineProperty(window, "usercolor", {
	get: () => color,
	set(v) {
		color = v;
		const guest = v === -1;
		talkbox.classList.toggle("frosty", guest);
		if (guest) talkbox.style.removeProperty("--usercolor");
		else talkbox.style.setProperty("--usercolor", v);
	}
});

const SERVERURL = "ws://localhost:8080";
const socket = new WebSocket(SERVERURL);
socket.addEventListener("message", (e) => {
	const data = JSON.parse(e.data);
	if (Array.isArray(data)) {
		for (const m of data) addMessage(m.content, m.color);
	} else {
		addMessage(data.content, data.color);
	}
});

const input = talkbox.querySelector("input");
input.addEventListener("keydown", (e) => {
	if (e.key !== "Enter") return;
	send();
});

function send() {
	const text = input.value.trim();
	if (!text) return;
	if (socket.readyState !== WebSocket.OPEN) return;
	socket.send(JSON.stringify({ content: text, color: usercolor }));
	input.value = "";
}


usercolor = -1;


function beepforlater() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1318.5, ctx.currentTime + 0.08);
  gain.gain.setValueAtTime(0.001, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.14);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}