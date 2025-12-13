# monlycee.js

[![npm version](https://img.shields.io/npm/v/monlycee.js)](https://www.npmjs.com/package/monlycee.js)
[![license](https://img.shields.io/github/license/lamnxzp/monlycee.js)](LICENSE)

A JavaScript/TypeScript API wrapper for **MonLycée.net**, the digital platform dedicated to high school students in Île-de-France.

> This library is in its **alpha stage** and under active development. Expect breaking API changes, bugs, and incomplete features.

## What is MonLycée.net?

MonLycée.net is the Digital Workspace (ENT - _Espace Numérique de Travail_) deployed for public high schools in the Île-de-France region (which includes Paris).

- It serves **470 public high schools** across the region (Academies of Créteil, Paris, and Versailles).
- It is accessible to over **650,000 users**: high school students, parents, teachers, and non-teaching staff.

## Installation

```sh
npm add monlycee.js
# or
pnpm add monlycee.js
# or
yarn add monlycee.js
# or
bun add monlycee.js
```

## Usage Examples

### Authentication

```typescript
import { MonLyceeClient } from "monlycee.js";

const client = new MonLyceeClient();

await client.login({
  username: "YOUR_USERNAME_HERE",
  password: "YOUR_PASSWORD_HERE",
});
```

### User Information

#### Get user info from ENT API

```typescript
const userInfo = await client.getUserInfo();
console.log(userInfo);
```

#### Get user profile from PSN API

```js
const profile = await client.getProfile();
console.log(profile);
```
### Mails

#### Basic usage

Fetch mails from inbox with default settings (30 per page, sorted by newest first):

```typescript
const mails = await client.getMails();
console.log(mails);
```

#### Advanced usage

Customize folder, pagination, and sorting:

```js
const mails = await client.getMails({
  folder: "SF_OUTBOX",   // Folder to fetch mails from
  page: 2,               // Page number (1-based, default: 1)
  perPage: 50,           // Items per page (default: 30, no limit)
  sortBy: "dateAsc",     // Sort order (default: "dateDesc")
});
console.log(mails);
```

#### Available Folder Types

| Folder             | Description                  |
| ------------------ | ---------------------------- |
| `SF_INBOX`         | Inbox (default)              |
| `SF_DRAFT`         | Drafts                       |
| `SF_OUTBOX`        | Sent messages                |
| `SF_JUNK`          | Spam/Junk                    |
| `SF_TRASH`         | Trash                        |
| `VF_flagged`       | Flagged messages             |
| `VF_attachments`   | Messages with attachments    |
| `VF_unread`        | Unread messages              |

#### Sort Options

| Option       | Description            |
| ------------ | ---------------------- |
| `dateDesc`   | Newest first (default) |
| `dateAsc`    | Oldest first           |

## License

MIT License - see [LICENSE](LICENSE) file for details.
