# monlycee.js

[![npm version](https://img.shields.io/npm/v/monlycee.js)](https://www.npmjs.com/package/monlycee.js)
[![license](https://img.shields.io/github/license/lamnxzp/monlycee.js)](LICENSE)

A JavaScript/TypeScript API wrapper for **MonLycée.net**, the digital platform dedicated to high school students in Île-de-France.

## What is MonLycée.net?

MonLycée.net is the Digital Workspace (ENT - *Espace Numérique de Travail*) deployed for public high schools in the Île-de-France region (which includes Paris).

* It serves **470 public high schools** across the region (Academies of Créteil, Paris, and Versailles).
* It is accessible to over **650,000 users**: high school students, parents, teachers, and non-teaching staff.

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

#### 1. Authentication

```js
import { MonLyceeClient } from "monlycee.js";

const client = new MonLyceeClient();

await client.login({
  username: "YOUR_USERNAME_HERE",
  password: "YOUR_PASSWORD_HERE",
});
```

#### 2. Get mails

**Basic usage:**
```js
const mails = await client.getMails();
console.log(mails);
```

**Advanced usage:**
```js
const mails = await client.getMails({
  folder: "SF_OUTBOX",   // Folder to fetch mails from (default: "SF_INBOX")
  page: 2,               // Page number (default: 1)
  perPage: 50,           // Items per page (default: 30)
  sortBy: "dateAsc"      // Sort order (default: "dateDesc")
});
console.log(mails);
```

**Folder options:**
- `"SF_INBOX"` - Inbox (default)
- `"SF_DRAFT"` - Drafts
- `"SF_OUTBOX"` - Sent
- `"SF_JUNK"` - Spam/Junk
- `"SF_TRASH"` - Trash
- `"VF_flagged"` - Flagged messages
- `"VF_attachments"` - Messages with attachments
- `"VF_unread"` - Unread messages

**Sort options:**
- `"dateDesc"` - Newest first (default)
- `"dateAsc"` - Oldest first


## License

MIT License - see [LICENSE](LICENSE) file for details.