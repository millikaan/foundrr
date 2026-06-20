/**
 * `mc telegram` — configure the Telegram leash from the CLI.
 *
 *   mc telegram link               Get a link code for the Founder SHARED bot.
 *   mc telegram status             Show the mode, install id, and linked state.
 *   mc telegram mode <shared|own|off>  Set how the leash is routed.
 *   mc telegram setup <botToken>   Store a bot token for "own" mode.
 *
 * Modes:
 *   - shared (default): one Founder cloud bot serves every install; link with a
 *     code (no BotFather, no token). `link`/`status` hit the live relay.
 *   - own:              the user's own grammY bot (M6/M7). `setup` + `/link`.
 *   - off:              no Telegram leash.
 *
 * We only touch the db (reusing loadConfig + openDb) and — for `link` — the live
 * shared relay; we never start the local bot here.
 */
import { loadConfig } from "../config.js";
import { openDb } from "../db/index.js";
import {
  getSettings,
  setTelegramMode,
  type TelegramMode,
} from "../db/settings-repo.js";
import { getTelegram, setBotToken } from "../db/telegram-repo.js";
import { SharedBot } from "../telegram/shared-bot.js";
import { resolveInstallId } from "../telemetry/install-id.js";
import { color, dim, err, ok } from "./util.js";

const USAGE =
  "usage: mc telegram link | status | mode <shared|own|off> | setup <botToken>\n";

const BOTFATHER_HELP = `To use your OWN bot (mode "own"):
  1. Open Telegram and message @BotFather
  2. Send /newbot and follow the prompts (name + username)
  3. BotFather replies with a token like 123456:ABC-DEF...
  4. Run: mc telegram mode own && mc telegram setup <that-token>`;

/** `mc telegram link` — shared: fetch a relay code; own: explain /link. */
async function runLink(): Promise<void> {
  const config = loadConfig();
  const db = openDb(config.dbPath);
  let mode: TelegramMode;
  try {
    mode = getSettings(db).telegramMode;
  } finally {
    db.close();
  }

  if (mode === "off") {
    err('Telegram is OFF. Enable it first: mc telegram mode shared');
    process.exitCode = 1;
    return;
  }

  if (mode === "own") {
    process.stdout.write(`\n${color.bold("Mission Control — Telegram link (own bot)")}\n\n`);
    process.stdout.write(
      `From Telegram, message your bot: ${color.bold("/link <ACCESS_TOKEN>")}\n`,
    );
    dim(
      `(your access token is in the startup URL after ?token=, or in ${config.home}/token)`,
    );
    process.stdout.write("\n");
    return;
  }

  // Shared mode: ask the live relay for a code.
  const installId = resolveInstallId(config.home);
  const sharedBot = new SharedBot(installId);
  const result = await sharedBot.link();

  process.stdout.write(`\n${color.bold("Mission Control — Telegram link (shared bot)")}\n\n`);
  if (!result) {
    err("Could not reach the shared bot relay. Check your connection and retry.");
    dim(`(install id: ${installId})`);
    process.stdout.write("\n");
    process.exitCode = 1;
    return;
  }

  process.stdout.write(
    `  Open Telegram, message ${color.bold(`@${result.botUsername}`)}, and send:\n\n`,
  );
  process.stdout.write(`      ${color.green(color.bold(`/link ${result.linkCode}`))}\n\n`);
  dim("The code is single-use and expires shortly — run this again for a fresh one.");
  dim(`(install id: ${installId})`);
  process.stdout.write("\n");
}

/** `mc telegram mode <shared|own|off>` — set the routing mode. */
function runMode(arg: string | undefined): void {
  if (arg !== "shared" && arg !== "own" && arg !== "off") {
    err(`unknown mode: ${arg ?? "(none)"} — expected shared | own | off`);
    process.stdout.write("usage: mc telegram mode <shared|own|off>\n");
    process.exitCode = 1;
    return;
  }

  const config = loadConfig();
  const db = openDb(config.dbPath);
  try {
    setTelegramMode(db, arg);
  } finally {
    db.close();
  }

  ok(`Telegram mode set to ${color.bold(arg)}.`);
  if (arg === "shared") {
    dim("Link the Founder shared bot: mc telegram link");
  } else if (arg === "own") {
    dim("Configure your own bot: mc telegram setup <botToken>, then mc telegram link");
  } else {
    dim("No notifications or approval requests will be sent.");
  }
  process.stdout.write("\n");
}

/** `mc telegram setup <botToken>` — store a bot token for "own" mode. */
function runSetup(botToken: string | undefined): void {
  if (!botToken || botToken.trim().length === 0) {
    process.stdout.write(`\n${color.bold("Mission Control — Telegram setup (own bot)")}\n\n`);
    dim(BOTFATHER_HELP);
    process.stdout.write("\n");
    return;
  }

  const config = loadConfig();
  const db = openDb(config.dbPath);
  try {
    setBotToken(db, botToken.trim());
  } finally {
    db.close();
  }

  ok("Saved bot token (for \"own\" mode).");
  process.stdout.write("\nNext steps:\n");
  process.stdout.write(
    `  ${color.cyan("1.")} Use your own bot: ${color.bold("mc telegram mode own")}\n`,
  );
  process.stdout.write(`  ${color.cyan("2.")} Start the daemon: ${color.bold("mc start")}\n`);
  process.stdout.write(
    `  ${color.cyan("3.")} From Telegram, message your bot: ${color.bold("/link <ACCESS_TOKEN>")}\n`,
  );
  dim(
    `     (your access token is in the startup URL after ?token=, or in ${config.home}/token)`,
  );
  process.stdout.write("\n");
}

/** `mc telegram status` — show mode, install id, and linked state. */
async function runStatus(): Promise<void> {
  const config = loadConfig();
  const db = openDb(config.dbPath);
  let mode: TelegramMode;
  let binding;
  try {
    mode = getSettings(db).telegramMode;
    binding = getTelegram(db);
  } finally {
    db.close();
  }
  const installId = resolveInstallId(config.home);

  process.stdout.write(`\n${color.bold("Mission Control — Telegram status")}\n\n`);
  process.stdout.write(`  Mode      : ${color.cyan(mode)}\n`);
  process.stdout.write(`  Install id: ${color.dim(installId)}\n`);

  if (mode === "shared") {
    const sharedBot = new SharedBot(installId);
    const linked = await sharedBot.isLinked();
    process.stdout.write(
      `  Linked    : ${linked ? color.green("yes (shared bot)") : color.red("not linked")}\n\n`,
    );
    dim(
      linked
        ? "Ready: notifications and approval requests reach your linked chat."
        : "Run `mc telegram link` to get a code and link your Telegram chat.",
    );
  } else if (mode === "own") {
    const envToken = process.env["TELEGRAM_BOT_TOKEN"]?.trim();
    const hasToken = Boolean(envToken) || Boolean(binding.botToken);
    const tokenSource = envToken ? "$TELEGRAM_BOT_TOKEN" : binding.botToken ? "db" : "none";
    process.stdout.write(
      `  Bot token : ${hasToken ? color.green("configured") : color.red("not set")} (${tokenSource})\n`,
    );
    process.stdout.write(
      `  Linked    : ${binding.chatId ? color.green(binding.chatId) : color.red("not linked")}\n\n`,
    );
    if (!hasToken) {
      dim("Run `mc telegram setup <botToken>` to configure your own bot.");
    } else if (!binding.chatId) {
      dim("Start the daemon and message your bot `/link <ACCESS_TOKEN>` to bind a chat.");
    } else {
      dim("Ready: notifications and approval requests will reach your linked chat.");
    }
  } else {
    process.stdout.write(`  Linked    : ${color.dim("(disabled)")}\n\n`);
    dim("Telegram is OFF. Enable it: mc telegram mode shared");
  }
  process.stdout.write("\n");
}

export async function runTelegramCli(
  sub: string | undefined,
  arg: string | undefined,
): Promise<void> {
  switch (sub) {
    case "link":
      await runLink();
      return;
    case "status":
      await runStatus();
      return;
    case "mode":
      runMode(arg);
      return;
    case "setup":
      runSetup(arg);
      return;
    default:
      err(`unknown telegram subcommand: ${sub ?? "(none)"}`);
      process.stdout.write(USAGE);
      process.exitCode = 1;
  }
}
