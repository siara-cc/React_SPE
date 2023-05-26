# Sqlite3 Page Explorer

This application lets the user open Sqlite databases and explore the internal organization of various objects such as schema, tables and indices.  To understand how Sqlite3 data is organized, please see [Database file format](https://www.sqlite.org/fileformat.html) from [Sqlite website](https://www.sqlite.org).

# About Sqlite (from their website)

SQLite is a self-contained, high-reliability, embedded, full-featured, public-domain, SQL database engine. SQLite is the most used database engine in the world.

SQLite is an embedded SQL database engine. Unlike most other SQL databases, SQLite does not have a separate server process. SQLite reads and writes directly to ordinary disk files. A complete SQL database with multiple tables, indices, triggers, and views, is contained in a single disk file. The database file format is cross-platform - you can freely copy a database between 32-bit and 64-bit systems or between big-endian and little-endian architectures. These features make SQLite a popular choice as an Application File Format. SQLite database files are a recommended storage format by the US Library of Congress.

# Installation

It is available in App stores for various platforms:

- [MacOS](https://itunes.apple.com/us/app/sqlite-page-explorer/id1444019689)
- [iPhone/iPad](https://itunes.apple.com/us/app/sqlite-page-explorer/id1466475834)
- [Android](https://play.google.com/store/apps/details?id=cc.siara.xroads)
- [Windows 10 UWP](https://www.microsoft.com/en-us/p/sqlite-page-explorer/9mtkt38glgc0)
- For Linux, the package is available as a Zip archive in the release section. Please unzip into a folder and click on the executable with the `Database` icon.

# Applications:

- Viewing internal organisation of Sqlite databases for software development, ethical hacking and troubleshooting
- Studying the format of Sqlite databases for academic purposes
- Forensic investigators may use it to view data from deleted pages

# Features

- Opening Sqlite databases, displaying first page (containing header and schema root)
- Opening internal pages which may be a B-Tree page, Freelist page or Overflow page
- Exploring root, internal and leaf pages of B-Tree pages hierarchically.
- Parsing and displaying cell content for B-Tree pages
- Exploring Freelist trunk and leaf pages

# User guide

On clicking the `Open database` button, the user can select the database file to explore.  The application opens the header, finds out the page size and provides links for the user to expand the `Header` and `Page 1`.

The first page invariably contains the header and the schema (definitions of tables and indices).  If the schema fits into the first page, the definitions can be seen on the `Page details` section in the form of table under `Cells` heading.

For exploring data of tables and indices, the `Open` button against each table/index under `Cells` section may be clicked. This opens the `root` page of the table or index. Further exploration can be carried out from there by clicking on buttons in the `Page details` sections.

If the schema spills over more than one page, the first page contains links to the different pages in which schema information is stored. These links can be seen in the `Page details` section under `Cells` heading and `Open` button against `Right most pointer` just above `Cells`.

For each page, the page content in bytes is shown in `Hex`, `Decimal` and `Text` representations.  It is also possible to open a random page from the database by entering page number and clicking on the `Open:` button at the bottom.

# Screenshots

![First page](scrshot0.png?raw=true)

![Schema page](scrshot1.png?raw=true)

![Table root page](scrshot2.png?raw=true)

# Support

If you face any problem, create issue in this website, or write to the author (Arundale Ramanathan) at arun@siara.cc.
