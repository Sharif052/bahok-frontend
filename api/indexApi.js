import request from "../utils/req";

module.exports = {
	helloWorld: async function (params) {
		//console.log("myConversationList myConversationList", params);
		return request(`/`, {
			method: "GET",
			data: params
		});
	},
}
