const timer = (container, btnCancel, btnSend) => {
  let minutes = 0;
  let seconds = 0;

  const idTimer = setInterval(() => {
    seconds += 1;

    if (seconds === 59) {
      seconds = 0;
      minutes += 1;
    }

    if (minutes === 1 && seconds > 0) {
      btnCancel.click();
    }

    container.textContent = `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  }, 1000);

  btnCancel.addEventListener("click", () => clearInterval(idTimer), {
    once: true,
  });
  btnSend.addEventListener("click", () => clearInterval(idTimer), {
    once: true,
  });
};

export default timer;
