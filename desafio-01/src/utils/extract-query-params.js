export function extractQueryParams(query) {
	return query
		.substr(1)
		.split("&")
		.reduce((queryParams, queryParam) => {
			const [key, value] = queryParam.split("=");

			queryParams[key] = value;

			return queryParams;
		}, {});
}
