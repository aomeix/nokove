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

const SERVERURL = "wss://nokove.onrender.com"; // 3rd time forgetting to update this
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
	if (!text) { togglePanel(); return; }
	if (socket.readyState !== WebSocket.OPEN) return;
	socket.send(JSON.stringify({ content: text, color: usercolor }));
	input.value = "";
}


usercolor = -1;
const panel = document.querySelector(".colorpanel");
panel.inert = true;

function togglePanel(open = !panel.classList.contains("open")) {
	panel.classList.toggle("open", open);
	panel.inert = !open;
}
input.addEventListener("input", () => togglePanel(false)); // typing closes it? would need to see user feedback
const sliders = [...panel.querySelectorAll("input")];
const [hue, sat, val] = sliders;
const hex = (h, s, v) => {
	s /= 100; v /= 100;
	const f = (n) => {
		const k = (n + h / 60) % 6;
		return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
	};
	return "#" + [f(5), f(3), f(1)].map((x) => Math.round(x * 255).toString(16).padStart(2, "0")).join("");
};
function paint() {
	const h = +hue.value, s = +sat.value, v = +val.value;
	for (const input of sliders) {
		input.parentElement.style.setProperty("--p", (input.value - input.min) / (input.max - input.min));
	}
	panel.style.setProperty("--s0", hex(h, 0, v));
	panel.style.setProperty("--s1", hex(h, 100, v));
	panel.style.setProperty("--v0", hex(h, s, +val.min));
	panel.style.setProperty("--v1", hex(h, s, 100));
	return hex(h, s, v);
}

panel.addEventListener("input", () => (usercolor = paint()));

paint();



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
