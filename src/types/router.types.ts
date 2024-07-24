import { RouterInputs, type RouterOutputs } from "~/utils/api";

export type GetBoardByIdOutput = RouterOutputs["board"]["byId"];
export type ReorderListInput = RouterInputs["list"]["reorder"];
export type ReorderCardInput = RouterInputs["card"]["reorder"];
export type UpdateBoardInput = RouterInputs["board"]["update"];
export type NewListInput = RouterInputs["list"]["create"];
export type NewCardInput = RouterInputs["card"]["create"];
export type NewBoardInput = RouterInputs["board"]["create"];
