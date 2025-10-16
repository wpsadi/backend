import data from "../data/team.json";
import type { AppContext } from "../types/types";
export const getTeam = async (c: AppContext) => {
	return c.json(data);
};
