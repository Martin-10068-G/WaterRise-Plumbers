const gallery = document.querySelector("[data-gallery]");

if (gallery) {
    const carousel = gallery.querySelector(".gallery-carousel");
    const track = gallery.querySelector(".gallery-track");
    const slides = Array.from(track.querySelectorAll(".gallery-slide"));
    const carouselSlides = slides;
    const secondaryTrack = document.createElement("div");
    secondaryTrack.className = "gallery-secondary";
    secondaryTrack.setAttribute("role", "group");
    secondaryTrack.setAttribute("aria-label", "More project photos");
    const previousButton = gallery.querySelector(".gallery-previous");
    const nextButton = gallery.querySelector(".gallery-next");
    const counter = document.querySelector("[data-gallery-count]");
    counter.after(secondaryTrack);
    const mobileView = window.matchMedia("(max-width: 760px)");
    let carouselIndex = 0;
    let viewerIndex = 0;
    let viewerTrigger = null;
    let lastTapAt = 0;
    let lastTappedSlide = null;
    let lastTouchTapAt = 0;
    let lastTouchTappedSlide = null;
    const doubleTapDelay = 500;

    track.classList.add("is-carousel");
    slides.forEach((slide, index) => {
        slide.classList.add(`gallery-photo-${index + 1}`);
    });
    const extraCards = slides.map((slide, index) => {
        const card = slide.cloneNode(true);
        card.dataset.galleryIndex = String(index);
        return card;
    });

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
        const slide = slides[viewerIndex];
        const image = slide.querySelector("img");
        viewerImage.src = image.currentSrc || image.src;
        viewerImage.alt = image.alt;
        viewerCaption.textContent = slide.querySelector("figcaption").textContent.trim();
    };

    const openViewer = (index, trigger = document.activeElement) => {
        viewerIndex = index;
        viewerTrigger = trigger;
        updateViewer();
        viewer.hidden = false;
        document.body.classList.add("gallery-viewer-open");
        closeViewerButton.focus();
    };

    const closeViewer = () => {
        viewer.hidden = true;
        document.body.classList.remove("gallery-viewer-open");
        if (viewerTrigger?.isConnected) {
            viewerTrigger.focus();
        }
    };

    const changeViewerPhoto = (direction) => {
        viewerIndex = (viewerIndex + direction + slides.length) % slides.length;
        updateViewer();
    };

    const togglePhotoFocus = (slide) => {
        const selectedIndex = carouselSlides.indexOf(slide);
        if (selectedIndex >= 0 && selectedIndex !== carouselIndex) {
            carouselIndex = selectedIndex;
            renderGallery();
        }
    };

    const renderGallery = () => {
        slides.forEach((slide) => {
            slide.classList.remove("is-visible", "is-current", "is-adjacent", "is-outer");
        });

        if (mobileView.matches) {
            track.replaceChildren(...slides);
            slides.forEach((slide) => slide.classList.add("is-visible"));
            secondaryTrack.replaceChildren();
            counter.textContent = `${slides.length} photos — scroll down to view all.`;
            return;
        }

        track.classList.remove("has-focused-photo");
        slides.forEach((slide) => {
            slide.classList.remove("is-focused");
            slide.setAttribute("aria-pressed", "false");
        });

        const visibleSlides = [-2, -1, 0, 1, 2].map((offset) => {
            const index = (carouselIndex + offset + carouselSlides.length) % carouselSlides.length;
            const slide = carouselSlides[index];
            slide.classList.add(Math.abs(offset) === 1 ? "is-adjacent" : "is-outer");
            return slide;
        });
        track.replaceChildren(...visibleSlides);
        visibleSlides.forEach((slide) => slide.classList.add("is-visible"));
        carouselSlides[carouselIndex].classList.add("is-current");
        secondaryTrack.replaceChildren(...extraCards);
        counter.textContent = `Carousel photo ${carouselIndex + 1} of ${carouselSlides.length} · ${slides.length} project photos`;
    };

    const onSlideClick = (event) => {
        if (!viewer.hidden) {
            return;
        }
        const slide = event.target.closest(".gallery-slide");
        if (slide) {
            const now = Date.now();
            const selectedIndex = slides.indexOf(slide);
            if (event.detail > 1 || (event.detail > 0 && lastTappedSlide === slide && now - lastTapAt < doubleTapDelay)) {
                event.preventDefault();
                lastTapAt = 0;
                lastTappedSlide = null;
                openViewer(selectedIndex, slide);
                return;
            }
            lastTapAt = now;
            lastTappedSlide = slide;
            if (!mobileView.matches) {
                togglePhotoFocus(slide);
            }
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
        if (lastTouchTappedSlide === slide && now - lastTouchTapAt < doubleTapDelay) {
            lastTouchTapAt = 0;
            lastTouchTappedSlide = null;
            openViewer(slides.indexOf(slide), slide);
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
            if (mobileView.matches) {
                openViewer(slides.indexOf(slide), slide);
            } else {
                togglePhotoFocus(slide);
            }
        }
    });

    secondaryTrack.addEventListener("click", (event) => {
        const slide = event.target.closest(".gallery-slide");
        if (slide) {
            openViewer(Number(slide.dataset.galleryIndex), slide);
        }
    });

    secondaryTrack.addEventListener("keydown", (event) => {
        const slide = event.target.closest(".gallery-slide");
        if (slide && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            openViewer(Number(slide.dataset.galleryIndex), slide);
        }
    });

    previousButton.addEventListener("click", () => {
        carouselIndex = (carouselIndex + carouselSlides.length - 1) % carouselSlides.length;
        renderGallery();
    });

    nextButton.addEventListener("click", () => {
        carouselIndex = (carouselIndex + 1) % carouselSlides.length;
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
