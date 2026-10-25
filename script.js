// Typing Effect

const text = [
  "Web Developer",
  "BCA Student",
  "Programmer",
  "Frontend Developer"
];

let count = 0;
let index = 0;
let currentText = "";
let letter = "";

(function type() {

  if (count === text.length) {
    count = 0;
  }

  currentText = text[count];
  letter = currentText.slice(0, ++index);

  document.querySelector(".left h3").textContent = letter;

  if (letter.length === currentText.length) {
    count++;
    index = 0;
    setTimeout(type, 1200);
  } else {
    setTimeout(type, 120);
  }

})();


// Scroll Animation

const sections = document.querySelectorAll("section");

window.addEventListener("scroll", () => {

sections.forEach(section => {

const top = window.scrollY;

const offset = section.offsetTop - 300;

if(top > offset){

section.style.opacity = "1";

section.style.transform = "translateY(0px)";

}

});

});