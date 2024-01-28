const EventEmitter = require("events");
const log = require("../logger.js");
const fs = require("fs");
// const path = require("path");
require("dotenv").config();
const options = require("../../../options.json");
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const { runInThisContext } = require("node:vm");
const discordClient = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

function exportObjectToJson(jobName, data) {
  if (!data || !data.id) {
    console.error("Object or object id is missing.");
    return;
  }

  const fileName = `object_${data.id}_${data.constructor.name}_${jobName}.json`;
  const jsonContent = JSON.stringify(data, null, 2);

  fs.writeFile(fileName, jsonContent, (err) => {
    if (err) {
      console.error(`Error exporting object to JSON file: ${err}`);
    } else {
      // console.log(`Object exported to ${fileName}`);
    }
  });
}

class Discordwrap extends EventEmitter {
  constructor() {
    super();
    this.interval = null;
    //   this.connectedAt = Date.now() / 1000; // - 10000;
    this.processedIds = new Set();
  }

  async postItem(jobName, data) {
    exportObjectToJson(jobName, data);

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
    let thisAvatarURL =
      "https://www.redditstatic.com/avatars/defaults/v2/avatar_default_7.png";

    // console.log(data.constructor.name);
    switch (data.constructor.name) {
      case "ModmailConversation":
        // console.log(data);

        subreddit = data.owner.displayName;
        modPing = options.subreddits[subreddit].modQueueNotifyRole || false;

        let messageBody = "Unknown";
        const userMessages = data.messages.filter(
          (message) => !message.author.name.isMod
        );

        if (userMessages.length > 0) {
          authorUser = userMessages[0].author.name.name;
          messageBody = userMessages[0].bodyMarkdown || "Unknown";
        } else {
          authorUser = data.messages[0].author.name.name;
          messageBody = data.messages[0].bodyMarkdown || "Unknown";
        }

        log.execute({
          emoji: logEmoji,
          module: jobName,
          feature: "Received",
          guild: subreddit,
          userName: authorUser,
          message: `${data.constructor?.name} Id: ${data.id}`,
        });

        var discordEmbed = new EmbedBuilder()
          .setColor(options.modMailEmbedColor)
          // .setURL(`https://www.reddit.com${data.permalink}`)
          .setAuthor({
            name: authorUser,
            // url: `https://www.reddit.com${data.permalink}`,
            iconURL: thisAvatarURL,
          })
          .setDescription(`${messageBody.slice(0, options.commentSize)}`)
          .setTitle("Mod Mail")
          .setURL(`https://mod.reddit.com/mail/all`);

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
      case "Comment":
        streamChannel =
          options.subreddits[data.subreddit.display_name].channelId || false;
        4;
        if (!streamChannel) {
          return;
        }
        authorUser = (await data.author?.name) || "Unknown";
        if (data.author_flair_css_class == "shadow") {
          thisAvatarURL = "https://i.imgur.com/6ipa7p2.png";
          authorUser += " [shadow]";
        }
        if (data.author_flair_css_class == "watch") {
          thisAvatarURL = "https://i.imgur.com/i8QOJLq.png";
          authorUser += " [watch]";
        }
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
            iconURL: thisAvatarURL,
          })
          .setDescription(`${data.body.slice(0, options.commentSize)}`);

        if (
          jobName == "getModQueue" ||
          (jobName == "getNewComments" &&
            data.banned_at_utc != null &&
            !data.spam)
        ) {
          discordEmbed.setColor(options.modQueueCommentEmbedColor);
          discordEmbed.setTitle("Mod Queue Comment");
          discordEmbed.setURL(
            `https://www.reddit.com/r/OnPatrolLive/about/modqueue`
          );
          modPing =
            options.subreddits[data.subreddit.display_name]
              .modQueueNotifyRole || false;
        } else if (
          jobName == "getSpam" ||
          data.spam ||
          data.banned_at_utc != null ||
          data.banned_by?.name == "AutoModerator" ||
          data.author_flair_css_class == "shadow"
        ) {
          discordEmbed.setColor(options.spamCommentEmbedColor);
          // discordEmbed.setTitle("Spam Comment");
          // discordEmbed.setURL(
          //   `https://www.reddit.com/r/OnPatrolLive/about/spam`
          // );
          // exportObjectToJson(data);
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
        if (data.author_flair_css_class == "shadow") {
          thisAvatarURL = "https://i.imgur.com/6ipa7p2.png";
          authorUser += " [shadow]";
        }
        if (data.author_flair_css_class == "watch") {
          thisAvatarURL = "https://i.imgur.com/i8QOJLq.png";
          authorUser += " [watch]";
        }
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
            name: `${authorUser}`,
            url: `https://www.reddit.com${data.permalink}`,
            iconURL: thisAvatarURL,
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

        if (
          jobName == "getModQueue" ||
          (jobName == "getNewSubmissions" &&
            data.banned_at_utc != null &&
            !data.spam)
        ) {
          discordEmbed.setColor(options.modQueuePostEmbedColor);
          discordEmbed.setTitle("Mod Queue Post");
          discordEmbed.setURL(
            `https://www.reddit.com/r/OnPatrolLive/about/modqueue`
          );
          modPing =
            options.subreddits[data.subreddit.display_name]
              .modQueueNotifyRole || false;
        } else if (
          jobName == "getSpam" ||
          data.spam ||
          data.banned_at_utc != null ||
          data.banned_by?.name == "AutoModerator" ||
          data.author_flair_css_class == "shadow"
        ) {
          discordEmbed.setColor(options.spamSubmissionEmbedColor);
          discordEmbed.setTitle("Spam Post");
          discordEmbed.setURL(
            `https://www.reddit.com/r/OnPatrolLive/about/spam`
          );
          // exportObjectToJson(data);
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
          message: `${data.constructor?.name} Id: ${data.id} Type: ${data.constructor.name}`,
        });

        break;
    }
  }
}
discordClient.login(process.env.DISCORD_TOKEN);
module.exports = Discordwrap;
