(function () {
	'use strict';

	document.querySelectorAll('.up2-posts-comment-form-block').forEach((block) => {
		const config = JSON.parse(
			block.dataset.upliftersSiteBuilderBlocksCommentsConfig || '{}'
		);

				const form = document.getElementById(
					config.formId
				);

				const message = document.getElementById(
					config.messageId
				);

				const button = document.getElementById(
					config.buttonId
				);

				const hint = document.getElementById(
					config.hintId
				);

				const nameEmailFields =
					document.getElementById(
						config.nameEmailId
					);

				const preview = document.getElementById(
					config.previewId
				);

				const previewItem =
					document.getElementById(
						config.previewItemId
					);

				const previewNote =
					document.getElementById(
						config.previewNoteId
					);

				if (
					!form ||
					form.dataset.upliftersSiteBuilderBlocksCommentsReady === '1'
				) {
					return;
				}

				form.dataset.upliftersSiteBuilderBlocksCommentsReady = '1';

				const isEmail = (value) =>
					/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
						String(value || '').trim()
					);

				const nameEmailIsVisible = () => {
					if (!nameEmailFields) {
						return false;
					}

					return (
						window.getComputedStyle(
							nameEmailFields
						).display !== 'none'
					);
				};

				const clearMessage = () => {
					if (!message) {
						return;
					}

					message.className =
						'up2-message';

					message.textContent = '';
				};

				const showMessage = (
					type,
					text
				) => {
					if (!message) {
						return;
					}

					message.className =
						'up2-message is-visible';

					message.classList.add(
						type === 'success'
							? 'is-success'
							: 'is-error'
					);

					message.textContent =
						String(text || '');
				};

				const setBusy = (busy) => {
					if (button) {
						button.disabled =
							Boolean(busy);
					}

					if (hint) {
						hint.textContent = busy
							? config.strings.sending
							: '';
					}
				};

				const showPreview = (
					commentText,
					response
				) => {
					if (
						!preview ||
						!previewItem ||
						!previewNote
					) {
						return;
					}

					preview.classList.add(
						'is-visible'
					);

					previewItem.textContent =
						commentText;

					const status =
						response?.status;

					const approved =
						response?.approved;

					if (
						status === 'approved' ||
						approved === 1 ||
						approved === '1' ||
						approved === true
					) {
						previewNote.textContent =
							config.strings.approved;

						return;
					}

					if (
						status === 'hold' ||
						status === 'pending' ||
						approved === 0 ||
						approved === '0' ||
						approved === false
					) {
						previewNote.textContent =
							config.strings.pending;

						return;
					}

					previewNote.textContent =
						config.strings.saved;
				};

				form.addEventListener(
					'submit',
					async (event) => {
						event.preventDefault();

						const formData =
							new FormData(form);

						const content = String(
							formData.get(
								'content'
							) || ''
						).trim();

						const authorName = String(
							formData.get(
								'author_name'
							) || ''
						).trim();

						const authorEmail = String(
							formData.get(
								'author_email'
							) || ''
						).trim();

						const showNameEmail =
							nameEmailIsVisible();

						clearMessage();

						if (!content) {
							showMessage(
								'error',
								config.strings
									.writeComment
							);

							return;
						}

						if (
							showNameEmail &&
							config.requireNameEmail
						) {
							if (!authorName) {
								showMessage(
									'error',
									config.strings
										.enterName
								);

								return;
							}

							if (
								!authorEmail ||
								!isEmail(
									authorEmail
								)
							) {
								showMessage(
									'error',
									config.strings
										.enterEmail
								);

								return;
							}
						}

						const requestBody = {
							post: Number(
								config.postId
							),
							content,
						};

						if (
							showNameEmail &&
							authorName
						) {
							requestBody.author_name =
								authorName;
						}

						if (
							showNameEmail &&
							authorEmail
						) {
							requestBody.author_email =
								authorEmail;
						}

						const headers = {
							'Content-Type':
								'application/json',
							Accept:
								'application/json',
						};

						if (config.nonce) {
							headers[
								'X-WP-Nonce'
							] = config.nonce;
						}

						setBusy(true);

						try {
							const response =
								await fetch(
									config.restUrl,
									{
										method:
											'POST',
										headers,
										credentials:
											'same-origin',
										body:
											JSON.stringify(
												requestBody
											),
									}
								);

							let responseData = null;

							try {
								responseData =
									await response.json();
							} catch (
								parseError
							) {
								responseData = null;
							}

							if (!response.ok) {
								const apiMessage =
									responseData &&
									typeof responseData.message ===
										'string'
										? responseData.message
										: config.errorText;

								throw new Error(
									apiMessage
								);
							}

							showMessage(
								'success',
								config.successText
							);

							showPreview(
								content,
								responseData
							);

							form.reset();

							window.dispatchEvent(
								new CustomEvent(
									'up2:comment:submitted',
									{
										detail: {
											postId:
												Number(
													config.postId
												),
											resp:
												responseData,
										},
									}
								)
							);
						} catch (error) {
							const exactMessage =
								error &&
								typeof error.message ===
									'string'
									? error.message
									: '';

							showMessage(
								'error',
								exactMessage ||
									config.errorText
							);
						} finally {
							setBusy(false);
						}
					}
				);
	});
})();
