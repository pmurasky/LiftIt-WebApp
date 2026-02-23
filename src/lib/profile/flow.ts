import { ApiError } from "@/lib/api/client";
import { auth0 } from "@/lib/auth0";
import {
  getUserProfile,
  provisionCurrentUser,
  type UserProfile,
} from "@/lib/profile/api";

interface ProfileFlowReady {
  status: "ready";
  profile: UserProfile;
}

interface ProfileFlowUnauthenticated {
  status: "unauthenticated";
}

interface ProfileFlowNeedsOnboarding {
  status: "needs_onboarding";
}

interface ProfileFlowBlocked {
  status: "blocked";
  message: string;
}

export type ProfileFlowState =
  | ProfileFlowReady
  | ProfileFlowUnauthenticated
  | ProfileFlowNeedsOnboarding
  | ProfileFlowBlocked;

export async function resolveProfileFlow(): Promise<ProfileFlowState> {
  const session = await auth0.getSession();
  const user = session?.user;
  const token = session?.tokenSet.accessToken;

  if (!user || !token || !user.sub || !user.email) {
    return { status: "unauthenticated" };
  }

  try {
    await provisionCurrentUser({ auth0Id: user.sub, email: user.email });
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 409)) {
      return {
        status: "blocked",
        message:
          error instanceof Error
            ? error.message
            : "Unable to provision your account right now.",
      };
    }
  }

  try {
    const profile = await getUserProfile(user.sub);
    return { status: "ready", profile };
  } catch (error) {
    if (error instanceof ApiError && error.isNotFound) {
      return { status: "needs_onboarding" };
    }

    return {
      status: "blocked",
      message:
        error instanceof Error
          ? error.message
          : "Unable to load your profile right now.",
    };
  }
}
