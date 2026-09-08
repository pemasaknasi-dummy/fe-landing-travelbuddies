import { useMutation } from "@tanstack/react-query";
import { agentApi, PayloadAgentSubmission } from "../api/agent-api";

export const useAgentSubmissionMutation = () => {
  return useMutation({
    mutationKey: ["agent-submission"],
    mutationFn: (payload: PayloadAgentSubmission) => {
      return agentApi.postAgentSubmission(payload);
    },
  });
};
