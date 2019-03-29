# DiscordPlaysGameboy - DPP Source
https://discord.gg/mVpKRwg - *Check out our Discord for the bot in action.*

An idea, put simply. Discord playing RPGs. Ideally, this project will eventually support GB/GBC/GBA, but currently only supports GBA.
### Commands:
All commands use the postfix `*`. Numbers for repeats always go after the `*`. Ex.: `a*6`.
None of the commands are case sensitive, so `A*3` and `a*3` are treated the same.

**NEW:** `n` or `new`. Fetches a new screenshot. Can be repeated up to 3 times.

**SAVE:** `sav`. Writes the save file, and then sends it in chat. Can't be repeated.

**HOLD/LETGO:** `hold*button` or `letgo`. Holds button until turned off. Supports d-pad and a/b button commands.

**BUTTONS:** Below are the commands. Repeats up to 10. Each button press is long enough to register, and GBAjs supports altering the hold time:
>`a` `b` `l` `r` `start` `select` `up` `down` `right` `left`
*New shorter syntax (optional):*
>`a` `b` `l` `r` `st` `sl` `u` `d` `rt` `lt`

In general, this project is designed to bring a few Node dependancies together in a neat and tidy way.
