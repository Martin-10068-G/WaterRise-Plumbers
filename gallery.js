const gallery = document.querySelector("[data-gallery]");

if (gallery) {
    const track = gallery.querySelector(".gallery-track");
    const slides = Array.from(track.querySelectorAll(".gallery-slide"));
    const previousButton = gallery.querySelector(".gallery-previous");
    const nextButton = gallery.querySelector(".gallery-next");
    const counter = document.querySelector("[data-gallery-count]");
    const mobileView = window.matchMedia("(max-width: 760px)");
    let currentIndex = 0;
    let lastTapAt = 0;
    let lastTappedSlide = null;
    let lastTouchTapAt = 0;
    let lastTouchTappedSlide = null;

    track.classList.add("is-carousel");

    const viewer = document.createElement("div");
    viewer.className = "gallery-viewer";
    viewer.hidden = true;
    viewer.setAttribute("role", "dialog");
    viewer.setAttribute("aria-modal", "true");
    viewer.setAttribute("aria-label", "Photo viewer");
    viewer.innerHTML = `
        <button class="viewer-close" type="button" aria-label="Close photo viewer">&times;</button>
        <button class="viewer-arrow viewer-previous" type="button" aria-label="Show previous photo">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 4-8 8 8 8"/></svg>
        </button>
        <figure class="viewer-figure">
            <img class="viewer-image" alt="">
            <figcaption class="viewer-caption"></figcaption>
        </figure>
        <button class="viewer-arrow viewer-next" type="button" aria-label="Show next photo">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 4 8 8-8 8"/></svg>
        </button>`;
    document.body.append(viewer);

    const viewerImage = viewer.querySelector(".viewer-image");
    const viewerCaption = viewer.querySelector(".viewer-caption");
    const closeViewerButton = viewer.querySelector(".viewer-close");
    const previousViewerButton = viewer.querySelector(".viewer-previous");
    const nextViewerButton = viewer.querySelector(".viewer-next");

    const updateViewer = () => {
        const slide = slides[currentIndex];
        const image = slide.querySelector("img");
        viewerImage.src = image.currentSrc || image.src;
        viewerImage.alt = image.alt;
        viewerCaption.textContent = slide.querySelector("figcaption").textContent.trim();
    };

    const openViewer = (index) => {
        currentIndex = index;
        renderGallery();
        updateViewer();
        viewer.hidden = false;
        document.body.classList.add("gallery-viewer-open");
        closeViewerButton.focus();
    };

    const closeViewer = () => {
        viewer.hidden = true;
        document.body.classList.remove("gallery-viewer-open");
        slides[currentIndex].focus();
    };

    const changeViewerPhoto = (direction) => {
        currentIndex = (currentIndex + direction + slides.length) % slides.length;
        renderGallery();
        updateViewer();
    };

    const togglePhotoFocus = (slide) => {
        if (!mobileView.matches) {
            const selectedIndex = slides.indexOf(slide);
            if (selectedIndex !== currentIndex) {
                currentIndex = selectedIndex;
                renderGallery();
            }
            return;
        }

        const shouldFocus = !slide.classList.contains("is-focused");
        slides.forEach((photo) => {
            photo.classList.remove("is-focused");
            photo.setAttribute("aria-pressed", "false");
        });

        if (shouldFocus) {
            slide.classList.add("is-focused");
            slide.setAttribute("aria-pressed", "true");
        }

        track.classList.toggle("has-focused-photo", shouldFocus);
    };

    const renderGallery = () => {
        slides.forEach((slide) => {
            slide.classList.remove("is-visible", "is-current", "is-adjacent", "is-outer");
        });

        if (mobileView.matches) {
            track.replaceChildren(...slides);
            slides.forEach((slide) => slide.classList.add("is-visible"));
            counter.textContent = `${slides.length} photos — scroll down to view all.`;
            return;
        }

        track.classList.remove("has-focused-photo");
        slides.forEach((slide) => {
            slide.classList.remove("is-focused");
            slide.setAttribute("aria-pressed", "false");
        });

        const visibleSlides = [-2, -1, 0, 1, 2].map((offset) => {
            const index = (currentIndex + offset + slides.length) % slides.length;
            const slide = slides[index];
            slide.classList.add(Math.abs(offset) === 1 ? "is-adjacent" : "is-outer");
            return slide;
        });
        track.replaceChildren(...visibleSlides);
        visibleSlides.forEach((slide) => slide.classList.add("is-visible"));
        slides[currentIndex].classList.add("is-current");
        counter.textContent = `Photo ${currentIndex + 1} of ${slides.length}`;
    };

    const onSlideClick = (event) => {
        if (!viewer.hidden) {
            return;
        }
        const slide = event.target.closest(".gallery-slide");
        if (slide) {
            const now = Date.now();
            const selectedIndex = slides.indexOf(slide);
            if (event.detail > 1 || (event.detail > 0 && lastTappedSlide === slide && now - lastTapAt < 400)) {
                event.preventDefault();
                lastTapAt = 0;
                lastTappedSlide = null;
                openViewer(selectedIndex);
                return;
            }
            lastTapAt = now;
            lastTappedSlide = slide;
            togglePhotoFocus(slide);
        }
    };

    track.addEventListener("pointerup", (event) => {
        if (event.pointerType !== "touch") {
            return;
        }
        const slide = event.target.closest(".gallery-slide");
        if (!slide) {
            return;
        }
        const now = Date.now();
        if (lastTouchTappedSlide === slide && now - lastTouchTapAt < 400) {
            lastTouchTapAt = 0;
            lastTouchTappedSlide = null;
            openViewer(slides.indexOf(slide));
            return;
        }
        lastTouchTapAt = now;
        lastTouchTappedSlide = slide;
    });

    track.addEventListener("click", onSlideClick);
    track.addEventListener("keydown", (event) => {
        const slide = event.target.closest(".gallery-slide");
        if (slide && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            togglePhotoFocus(slide);
        }
    });

    previousButton.addEventListener("click", () => {
        currentIndex = (currentIndex + slides.length - 1) % slides.length;
        renderGallery();
    });

    nextButton.addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % slides.length;
        renderGallery();
    });

    closeViewerButton.addEventListener("click", closeViewer);
    previousViewerButton.addEventListener("click", () => changeViewerPhoto(-1));
    nextViewerButton.addEventListener("click", () => changeViewerPhoto(1));
    viewer.addEventListener("click", (event) => {
        if (event.target === viewer) {
            closeViewer();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (viewer.hidden) {
            return;
        }
        if (event.key === "Escape") {
            closeViewer();
        } else if (event.key === "ArrowLeft") {
            changeViewerPhoto(-1);
        } else if (event.key === "ArrowRight") {
            changeViewerPhoto(1);
        }
    });

    gallery.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") {
            previousButton.click();
        } else if (event.key === "ArrowRight") {
            nextButton.click();
        }
    });

    mobileView.addEventListener("change", renderGallery);
    window.addEventListener("resize", renderGallery);
    renderGallery();
}
