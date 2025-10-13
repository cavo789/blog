window.addEventListener("load", (event) => {
    // This function will search for short code like "==IpsoLorem=="
    // i.e. a portion of text between two equal sign and will replace it
    // to "<mark>IpsoLorem</mark>" so we can then use CSS to highlight
    // that portion.
    Reveal.on("slidechanged", function (event) {
        var re = /==([^=]*)==/;
        event.currentSlide.innerHTML = event.currentSlide.innerHTML.replace(new RegExp(re, "g"), "<mark>$1</mark>");
    } );
});
