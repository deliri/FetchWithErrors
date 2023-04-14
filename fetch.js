const API_URL = "{{your_site_base_url}}";

class ApiError extends Error {
	constructor(message, data, status) {
		super(message);
		let response = null;
		let isObject = false;

		try {
			response = JSON.parse(data);
			isObject = true;
		} catch (e) {
			response = data;
		}

		this.response = response;
		this.status = status;
		this.name = "ApiError";
		this.message = `${message}\nResponse:\n${
			isObject ? JSON.stringify(response, null, 2) : response
		}`;
	}
}

async function fetchResource(path, userOptions = {}) {
	const defaultOptions = {};
	const defaultHeaders = {};

	const options = {
		...defaultOptions,
		...userOptions,
		headers: {
			...defaultHeaders,
			...userOptions.headers,
		},
	};

	const url = `${API_URL}/${path}`;
	let response;

	try {
		response = await fetch(url, options);

		if (response.status === 401) {
			// Handle unauthorized requests, e.g., redirect to login page
			return;
		}

		if (response.status < 200 || response.status >= 300) {
			const errorText = await response.text();
			throw new ApiError(
				`Request failed with status ${response.status}.`,
				errorText,
				response.status,
			);
		}

		return await response.json();
	} catch (error) {
		if (response) {
			throw new ApiError(
				`Request failed with status ${response.status}.`,
				error,
				response.status,
			);
		} else {
			throw new ApiError(error.toString(), null, "REQUEST_FAILED");
		}
	}
}
