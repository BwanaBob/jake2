const EventEmitter = require("events");
const log = require("../logger.js");
// const fs = require("fs");
// const path = require("path");
require("dotenv").config();
const options = require("../../../options.json");
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const { runInThisContext } = require("node:vm");
const discordClient = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const defaultAvatarURL =
  "https://www.redditstatic.com/avatars/defaults/v2/avatar_default_7.png";

class Discordwrap extends EventEmitter {
  constructor() {
    super();
    this.interval = null;
    //   this.connectedAt = Date.now() / 1000; // - 10000;
    this.processedIds = new Set();
  }

  async postItem(jobName, data) {
    var streamChannel = "1121273754857775114";
    var modPing = "";

    let logEmoji = "💬";
    switch (jobName) {
      case "getNewComments":
        logEmoji = "💬";
        break;
      case "getNewSubmissions":
        logEmoji = "📌";
        break;
      case "getNewModmail":
        logEmoji = "📨";
        break;
      case "getSpam":
        logEmoji = "📫";
        break;
      case "getModQueue":
        logEmoji = "📋";
        break;
      default:
        logEmoji = "💬";
    }

    let authorUser = "Unknown";
    let subreddit = "Unknown";
    // console.log(data.constructor.name);
    switch (data.constructor.name) {
      case "ModmailConversation":
        subreddit = data.owner.displayName;

        const userMessages = data.messages.filter(
          (message) => !message.author.name.isMod
        );

        if (userMessages.length > 0) {
          authorUser = userMessages[0].author.name.name;
        } else {
          authorUser = data.messages[0].author.name.name;
        }

        log.execute({
          emoji: logEmoji,
          module: jobName,
          feature: "Received",
          guild: subreddit,
          userName: authorUser,
          message: `${data.constructor?.name} Id: ${data.id}`,
        });
        break;
      case "Comment":
        streamChannel =
          options.subreddits[data.subreddit.display_name].channelId || false;
        4;
        if (!streamChannel) {
          return;
        }
        authorUser = (await data.author?.name) || "Unknown";
        subreddit = (await data.subreddit?.display_name) || "Unknown";
        log.execute({
          emoji: logEmoji,
          module: jobName,
          feature: "Received",
          guild: subreddit,
          userName: authorUser,
          message: `${data.constructor?.name} Id: ${data.id}`,
        });
        var discordEmbed = new EmbedBuilder()
          .setColor(options.commentEmbedColor)
          .setURL(`https://www.reddit.com${data.permalink}`)
          .setAuthor({
            name: authorUser,
            url: `https://www.reddit.com${data.permalink}`,
            iconURL: defaultAvatarURL,
          })
          .setDescription(`${data.body.slice(0, options.commentSize)}`);

        if (jobName == "getModQueue") {
          discordEmbed.setColor(options.modQueueCommentEmbedColor);
          discordEmbed.setTitle("Mod Queue Comment");
          discordEmbed.setURL(
            `https://www.reddit.com/r/OnPatrolLive/about/modqueue`
          );
          modPing =
            options.subreddits[data.subreddit.display_name]
              .modQueueNotifyRole || false;
        }

        if (jobName == "getSpam") {
          discordEmbed.setColor(options.spamCommentEmbedColor);
          discordEmbed.setTitle("Spam Comment");
          discordEmbed.setURL(
            `https://www.reddit.com/r/OnPatrolLive/about/spam`
          );
        }

        if (modPing) {
          await discordClient.channels.cache
            .get(streamChannel)
            .send({ embeds: [discordEmbed], content: `<@&${modPing}>` })
            .catch((err) => {
              console.error(
                `[ERROR] Sending message ${data.id} -`,
                err.message
              );
            });
        } else {
          await discordClient.channels.cache
            .get(streamChannel)
            .send({ embeds: [discordEmbed] })
            .catch((err) => {
              console.error(
                `[ERROR] Sending message ${data.id} -`,
                err.message
              );
            });
        }

        break;
      case "Submission":
        streamChannel =
          options.subreddits[data.subreddit.display_name].channelId || false;
        if (!streamChannel) {
          return;
        }
        authorUser = (await data.author?.name) || "Unknown";
        subreddit = (await data.subreddit?.display_name) || "Unknown";
        log.execute({
          emoji: logEmoji,
          module: jobName,
          feature: "Received",
          guild: subreddit,
          userName: authorUser,
          message: `${data.constructor?.name} Id: ${data.id}`,
        });
        var discordEmbed = new EmbedBuilder()
          .setColor(options.submissionEmbedColor)
          .setURL(`https://www.reddit.com${data.permalink}`)
          .setAuthor({
            name: `${data.author.name}`,
            url: `https://www.reddit.com${data.permalink}`,
            iconURL: defaultAvatarURL,
          });

        var postMessage = `**${data.title.slice(0, 300)}**`;
        if (data.selftext) {
          postMessage += `\n${data.selftext.slice(0, 500)}`;
        }
        var postEmoji = "📌";
        if (!data.is_self) {
          postEmoji = "🔗";
          if (data.post_hint !== "image") {
            postMessage += `\n[Link](${data.url})`;
          }
        }
        if (data.post_hint == "rich:video" || data.is_video == true) {
          postEmoji = "🎦";
        }
        if (data.post_hint == "image") {
          postEmoji = "📸";
          discordEmbed.setImage(data.url);
        }
        if (data.poll_data) {
          postEmoji = "✅";
        }

        if (
          data.thumbnail &&
          data.thumbnail !== "default" &&
          data.thumbnail !== "self" &&
          data.post_hint !== "image"
        ) {
          discordEmbed.setThumbnail(data.thumbnail);
        }

        discordEmbed.setDescription(`${postEmoji}  ${postMessage}`);

        if (jobName == "getModQueue") {
          discordEmbed.setColor(options.modQueuePostEmbedColor);
          discordEmbed.setTitle("Mod Queue Post");
          discordEmbed.setURL(
            `https://www.reddit.com/r/OnPatrolLive/about/modqueue`
          );
          modPing =
            options.subreddits[data.subreddit.display_name]
              .modQueueNotifyRole || false;
        }
        if (jobName == "getSpam") {
          discordEmbed.setColor(options.spamSubmissionEmbedColor);
          discordEmbed.setTitle("Spam Post");
          discordEmbed.setURL(
            `https://www.reddit.com/r/OnPatrolLive/about/spam`
          );
        }

        if (modPing) {
          await discordClient.channels.cache
            .get(streamChannel)
            .send({ embeds: [discordEmbed], content: `<@&${modPing}>` })
            .catch((err) => {
              console.error(
                `[ERROR] Sending message ${data.id} -`,
                err.message
              );
            });
        } else {
          await discordClient.channels.cache
            .get(streamChannel)
            .send({ embeds: [discordEmbed] })
            .catch((err) => {
              console.error(
                `[ERROR] Sending message ${data.id} -`,
                err.message
              );
            });
        }
        break;
      default:
        authorUser = (await data.author?.name) || "Unknown";
        subreddit = (await data.subreddit?.display_name) || "Unknown";
        log.execute({
          emoji: logEmoji,
          module: jobName,
          feature: "Received",
          guild: subreddit,
          userName: authorUser,
          message: `${data.constructor?.name} Id: ${data.id}`,
        });

        break;
    }
  }
}
discordClient.login(process.env.DISCORD_TOKEN);
module.exports = Discordwrap;
