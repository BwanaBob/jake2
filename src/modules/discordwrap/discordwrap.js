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
    // exportObjectToJson(jobName, data);

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
        streamChannel = options.subreddits[subreddit].channelId || false;
        if (!streamChannel) {
          console.log("No stream channel found for modmail:");
          console.log(data);
          streamChannel = "1121273754857775114";
          // return;
        }
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
        if (!streamChannel) {
          return;
        }
        authorUser = (await data.author?.name) || "Unknown";
        if (data.author_flair_css_class == "shadow") {
          thisAvatarURL = "https://i.imgur.com/6eRa9QF.png";
          authorUser += " [shadow]";
        }
        if (data.author_flair_css_class == "watch") {
          thisAvatarURL = "https://i.imgur.com/SQ8Yka8.png";
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
          data.banned_at_utc != null &&
          (data.author_flair_css_class == "shadow" ||
            data.spam ||
            data.body == "!tidy")
        ) {
          discordEmbed.setColor(options.spamCommentEmbedColor);
          // discordEmbed.setTitle("Spam Comment");
          // discordEmbed.setURL(
          //   `https://www.reddit.com/r/OnPatrolLive/about/spam`
          // );
          // exportObjectToJson(data);
        } else if (
          jobName == "getModQueue" ||
          (data.banned_at_utc != null &&
            data.author_flair_css_class !== "shadow" &&
            !data.spam)
        ) {
          if (data.num_reports && data.num_reports > 0) {
            discordEmbed.setColor(options.reportedCommentEmbedColor);
            discordEmbed.setTitle("Reported Comment");
          } else {
            discordEmbed.setColor(options.modQueueCommentEmbedColor);
            discordEmbed.setTitle("Mod Queue Comment");
          }
          discordEmbed.setURL(
            `https://www.reddit.com/r/OnPatrolLive/about/modqueue`
          );
          modPing =
            options.subreddits[data.subreddit.display_name]
              .modQueueNotifyRole || false;
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
          thisAvatarURL = "https://i.imgur.com/6eRa9QF.png";
          authorUser += " [shadow]";
        }
        if (data.author_flair_css_class == "watch") {
          thisAvatarURL = "https://i.imgur.com/SQ8Yka8.png";
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

        var postMessage = `**${data.title.slice(0, options.commentSize)}**`;
        if (data.selftext) {
          postMessage += `\n${data.selftext.slice(0, options.commentSize)}`;
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
          data.thumbnail !== "nsfw" &&
          data.post_hint !== "image"
        ) {
          try {
            discordEmbed.setThumbnail(data.thumbnail);
          } catch (err) {
            console.error(
              `[ERROR] Setting Thumbnail ${data.thumbnail} -`,
              err.message
            );
          }
        }

        discordEmbed.setDescription(`${postEmoji}  ${postMessage}`);

        if (
          data.banned_at_utc != null &&
          (data.author_flair_css_class == "shadow" || data.spam)
        ) {
          discordEmbed.setColor(options.spamSubmissionEmbedColor);
          discordEmbed.setTitle("Spam Post");
          discordEmbed.setURL(
            `https://www.reddit.com/r/OnPatrolLive/about/spam`
          );
        } else if (
          jobName == "getModQueue" ||
          (data.banned_at_utc != null &&
            data.author_flair_css_class !== "shadow" &&
            !data.spam)
        ) {
          if (data.num_reports && data.num_reports > 0) {
            discordEmbed.setColor(options.reportedPostEmbedColor);
            discordEmbed.setTitle("Reported Post");
          } else {
            discordEmbed.setColor(options.modQueuePostEmbedColor);
            discordEmbed.setTitle("Mod Queue Post");
          }
          discordEmbed.setURL(
            `https://www.reddit.com/r/OnPatrolLive/about/modqueue`
          );
          modPing =
            options.subreddits[data.subreddit.display_name]
              .modQueueNotifyRole || false;
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
