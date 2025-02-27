const apiUrl = process.env.DEEPTRACK_BACKEND_URL;

const BACKEND_URLS = {
	"Get All Company Members": `${apiUrl}/v1/users/company-members`,
};

export { BACKEND_URLS };