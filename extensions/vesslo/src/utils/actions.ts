import { open, showToast, Toast, closeMainWindow } from "@raycast/api";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const VESSLO_URL_SCHEME = "vesslo://";

export async function openInVesslo(bundleId: string) {
  try {
    await closeMainWindow();
    await open(`${VESSLO_URL_SCHEME}app/${bundleId}`);
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to open in Vesslo",
      message: String(error),
    });
  }
}

export function getAppStoreUrl(appStoreId: string): string {
  return `macappstore://apps.apple.com/app/id${appStoreId}`;
}

export function getBrewUpdateCommand(caskName: string): string {
  // In search-apps, we used a raycast script command URL, but we can also just execute it if we want consistent behavior.
  // However, for Action.OpenInBrowser (which is what search-apps used), we need a URL.
  // The original search-apps used: raycast://script-command/run?script=...
  // Let's keep that for now if we want to use Action.OpenInBrowser, OR we can use the Action onAction handler like in updates.tsx

  // For now, let's provide the script URL helper
  return `raycast://script-command/run?script=${encodeURIComponent(`brew upgrade --cask ${JSON.stringify(caskName)}`)}`;
}

export async function runBrewUpgrade(caskName: string, appName: string) {
  try {
    await showToast({
      style: Toast.Style.Animated,
      title: `Updating ${appName}...`,
    });

    const { stdout } = await execAsync(
      `brew upgrade --cask ${JSON.stringify(caskName)}`,
    );

    await showToast({
      style: Toast.Style.Success,
      title: `${appName} updated!`,
      message: stdout || "Update complete",
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    await showToast({
      style: Toast.Style.Failure,
      title: `Failed to update ${appName}`,
      message: errorMessage,
    });
  }
}
