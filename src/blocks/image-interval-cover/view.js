(function () {
	document.querySelectorAll('.uplifters-site-builder-blocks-image-interval-cover').forEach((block) => {
		if (
			block.dataset.upliftersSiteBuilderBlocksCarouselInitialized === "true"
		) {
			return;
		}

		block.dataset.upliftersSiteBuilderBlocksCarouselInitialized = "true";

				const track = block.querySelector(
					".uplifters-site-builder-blocks-image-interval-cover__track"
				);

				const originalSlides = Array.from(
					block.querySelectorAll(
						".uplifters-site-builder-blocks-image-interval-cover__item"
					)
				);

				const dots = Array.from(
					block.querySelectorAll(
						".uplifters-site-builder-blocks-image-interval-cover__dot"
					)
				);

				const previousButton = block.querySelector(
					".uplifters-site-builder-blocks-image-interval-cover__arrow--previous"
				);

				const nextButton = block.querySelector(
					".uplifters-site-builder-blocks-image-interval-cover__arrow--next"
				);

				const total = originalSlides.length;

				if (!track || total <= 0) {
					return;
				}

				const reducedMotionQuery =
					window.matchMedia(
						"(prefers-reduced-motion: reduce)"
					);

				let currentIndex = 0;
				let intervalId = null;
				let transitionTimer = null;
				let resizeTimer = null;
				let clonedSlides = [];
				let isPaused = false;
				let isTransitioning = false;
				let touchStartX = 0;
				let touchEndX = 0;

				const getColumns = () => {
					const rawValue = window
						.getComputedStyle(block)
						.getPropertyValue(
							"--uplifters-site-builder-blocks-image-interval-cover-columns"
						);

					const parsedValue =
						Number.parseInt(
							rawValue,
							10
						);

					if (
						!Number.isFinite(
							parsedValue
						)
					) {
						return 1;
					}

					return Math.max(
						1,
						Math.min(
							total,
							parsedValue
						)
					);
				};

				const getDuration = () => {
					const rawValue = window
						.getComputedStyle(block)
						.getPropertyValue(
							"--uplifters-site-builder-blocks-image-interval-cover-duration"
						);

					const parsedValue =
						Number.parseInt(
							rawValue,
							10
						);

					if (
						!Number.isFinite(
							parsedValue
						)
					) {
						return 3000;
					}

					return Math.max(
						1000,
						Math.min(
							10000,
							parsedValue
						)
					);
				};

				const normalizeIndex = (index) => {
					return (
						(index % total) +
						total
					) % total;
				};

				const getTranslatePercentage = (
					index
				) => {
					return (
						index *
						(100 / getColumns())
					);
				};

				const setTrackPosition = (
					index,
					animate = true
				) => {
					track.style.transition =
						animate &&
						!reducedMotionQuery.matches
							? "transform 0.6s ease"
							: "none";

					track.style.transform =
						`translate3d(-${getTranslatePercentage(
							index
						)}%, 0, 0)`;
				};

				const removeClonedSlides = () => {
					clonedSlides.forEach(
						(slide) => {
							slide.remove();
						}
					);

					clonedSlides = [];
				};

				const prepareClone = (slide) => {
					const clone =
						slide.cloneNode(true);

					clone.classList.add(
						"uplifters-site-builder-blocks-image-interval-cover__item--clone"
					);

					clone.removeAttribute(
						"data-slide-index"
					);

					clone.setAttribute(
						"aria-hidden",
						"true"
					);

					clone
						.querySelectorAll(
							"[id]"
						)
						.forEach((element) => {
							element.removeAttribute(
								"id"
							);
						});

					clone
						.querySelectorAll(
							"button, a, input, select, textarea, [tabindex]"
						)
						.forEach((element) => {
							element.setAttribute(
								"tabindex",
								"-1"
							);
						});

					return clone;
				};

				const createClonedSlides = () => {
					removeClonedSlides();

					/*
					 * Clone a complete image cycle plus enough extra
					 * images to fill all visible desktop columns.
					 */
					const cloneCount =
						total + getColumns();

					for (
						let index = 0;
						index < cloneCount;
						index += 1
					) {
						const sourceSlide =
							originalSlides[
								index % total
							];

						const clone =
							prepareClone(
								sourceSlide
							);

						track.appendChild(clone);
						clonedSlides.push(clone);
					}
				};

				const updateAccessibility = () => {
					const columns =
						getColumns();

					originalSlides.forEach(
						(slide, index) => {
							let relativeIndex =
								index -
								currentIndex;

							if (
								relativeIndex < 0
							) {
								relativeIndex +=
									total;
							}

							const isVisible =
								relativeIndex >= 0 &&
								relativeIndex <
									columns;

							slide.setAttribute(
								"aria-hidden",
								isVisible
									? "false"
									: "true"
							);
						}
					);

					const activeDotIndex =
						normalizeIndex(
							currentIndex
						);

					dots.forEach(
						(dot, index) => {
							const isActive =
								index ===
								activeDotIndex;

							dot.hidden = false;

							dot.classList.toggle(
								"is-active",
								isActive
							);

							dot.setAttribute(
								"aria-current",
								isActive
									? "true"
									: "false"
							);
						}
					);
				};

				const silentlyResetToStart =
					() => {
						window.clearTimeout(
							transitionTimer
						);

						transitionTimer =
							window.setTimeout(
								() => {
									currentIndex = 0;
									isTransitioning =
										false;

									setTrackPosition(
										0,
										false
									);

									/*
									 * Force the non-animated position
									 * before restoring transitions.
									 */
									void track.offsetWidth;

									updateAccessibility();
								},
								reducedMotionQuery.matches
									? 0
									: 620
							);
					};

				const goToNext = () => {
					if (isTransitioning) {
						return;
					}

					isTransitioning = true;
					currentIndex += 1;

					setTrackPosition(
						currentIndex,
						true
					);

					updateAccessibility();

					if (
						currentIndex >= total
					) {
						silentlyResetToStart();
						return;
					}

					window.clearTimeout(
						transitionTimer
					);

					transitionTimer =
						window.setTimeout(
							() => {
								isTransitioning =
									false;
							},
							reducedMotionQuery.matches
								? 0
								: 620
						);
				};

				const goToPrevious = () => {
					if (isTransitioning) {
						return;
					}

					isTransitioning = true;

					if (currentIndex <= 0) {
						currentIndex = total;

						setTrackPosition(
							currentIndex,
							false
						);

						void track.offsetWidth;
					}

					currentIndex -= 1;

					setTrackPosition(
						currentIndex,
						true
					);

					updateAccessibility();

					window.clearTimeout(
						transitionTimer
					);

					transitionTimer =
						window.setTimeout(
							() => {
								isTransitioning =
									false;
							},
							reducedMotionQuery.matches
								? 0
								: 620
						);
				};

				const goToIndex = (
					targetIndex
				) => {
					if (isTransitioning) {
						return;
					}

					const normalizedTarget =
						normalizeIndex(
							targetIndex
						);

					isTransitioning = true;
					currentIndex =
						normalizedTarget;

					setTrackPosition(
						currentIndex,
						true
					);

					updateAccessibility();

					window.clearTimeout(
						transitionTimer
					);

					transitionTimer =
						window.setTimeout(
							() => {
								isTransitioning =
									false;
							},
							reducedMotionQuery.matches
								? 0
								: 620
						);
				};

				const stopAutoplay = () => {
					if (intervalId !== null) {
						window.clearInterval(
							intervalId
						);

						intervalId = null;
					}
				};

				const startAutoplay = () => {
					stopAutoplay();

					/*
					 * Do not compare image count with visible columns.
					 * Desktop autoplay should work even when every
					 * original image is initially visible.
					 */
					if (
						total <= 1 ||
						isPaused ||
						reducedMotionQuery.matches ||
						document.hidden
					) {
						return;
					}

					intervalId =
						window.setInterval(
							goToNext,
							getDuration()
						);
				};

				const restartAutoplay = () => {
					stopAutoplay();
					startAutoplay();
				};

				const pauseCarousel = () => {
					isPaused = true;
					stopAutoplay();
				};

				const resumeCarousel = () => {
					isPaused = false;
					startAutoplay();
				};

				previousButton?.addEventListener(
					"click",
					() => {
						goToPrevious();
						restartAutoplay();
					}
				);

				nextButton?.addEventListener(
					"click",
					() => {
						goToNext();
						restartAutoplay();
					}
				);

				dots.forEach((dot) => {
					dot.addEventListener(
						"click",
						() => {
							const targetIndex =
								Number.parseInt(
									dot.dataset
										.slideTo ||
										"0",
									10
								);

							goToIndex(
								targetIndex
							);

							restartAutoplay();
						}
					);
				});

				block.addEventListener(
					"mouseenter",
					pauseCarousel
				);

				block.addEventListener(
					"mouseleave",
					resumeCarousel
				);

				block.addEventListener(
					"focusin",
					pauseCarousel
				);

				block.addEventListener(
					"focusout",
					(event) => {
						if (
							!block.contains(
								event.relatedTarget
							)
						) {
							resumeCarousel();
						}
					}
				);

				block.addEventListener(
					"touchstart",
					(event) => {
						touchStartX =
							event.changedTouches[0]
								.screenX;

						touchEndX =
							touchStartX;

						pauseCarousel();
					},
					{
						passive: true,
					}
				);

				block.addEventListener(
					"touchmove",
					(event) => {
						touchEndX =
							event.changedTouches[0]
								.screenX;
					},
					{
						passive: true,
					}
				);

				block.addEventListener(
					"touchend",
					() => {
						const swipeDistance =
							touchEndX -
							touchStartX;

						if (
							Math.abs(
								swipeDistance
							) >= 40
						) {
							if (
								swipeDistance < 0
							) {
								goToNext();
							} else {
								goToPrevious();
							}
						}

						resumeCarousel();
					},
					{
						passive: true,
					}
				);

				document.addEventListener(
					"visibilitychange",
					() => {
						if (document.hidden) {
							stopAutoplay();
						} else {
							startAutoplay();
						}
					}
				);

				const handleMotionPreference =
					() => {
						setTrackPosition(
							currentIndex,
							false
						);

						if (
							reducedMotionQuery.matches
						) {
							stopAutoplay();
						} else {
							startAutoplay();
						}
					};

				if (
					typeof reducedMotionQuery
						.addEventListener ===
					"function"
				) {
					reducedMotionQuery.addEventListener(
						"change",
						handleMotionPreference
					);
				} else if (
					typeof reducedMotionQuery
						.addListener ===
					"function"
				) {
					reducedMotionQuery.addListener(
						handleMotionPreference
					);
				}

				window.addEventListener(
					"resize",
					() => {
						window.clearTimeout(
							resizeTimer
						);

						resizeTimer =
							window.setTimeout(
								() => {
									window.clearTimeout(
										transitionTimer
									);

									isTransitioning =
										false;

									currentIndex =
										normalizeIndex(
											currentIndex
										);

									createClonedSlides();

									setTrackPosition(
										currentIndex,
										false
									);

									updateAccessibility();
									restartAutoplay();
								},
								150
							);
					}
				);

				createClonedSlides();

				setTrackPosition(
					0,
					false
				);

				updateAccessibility();
				startAutoplay();
	});
})();
