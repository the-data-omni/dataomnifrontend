// "use client";

// import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
// import { Box, Stack, Typography, Tabs, Tab } from "@mui/material";
// import { ChatContext } from "./chat-context";
// import { MessageAdd } from "./message-add";
// import { MessageBox } from "./message-box";
// import { ThreadToolbar } from "./thread-toolbar";
// import type { MessageType, ThreadType } from "./types";

// // Our global sample data
// export const FINANCIAL_DATA = [
//   {
//     "competitorname": "100 Grand",
//     "chocolate": 1,
//     "fruity": 0,
//     "caramel": 1,
//     "peanutyalmondy": 0,
//     "nougat": 0,
//     "crispedricewafer": 1,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.73199999,
//     "pricepercent": 0.86000001,
//     "winpercent": 66.971725
//   },
//   {
//     "competitorname": "3 Musketeers",
//     "chocolate": 1,
//     "fruity": 0,
//     "caramel": 0,
//     "peanutyalmondy": 0,
//     "nougat": 1,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.60399997,
//     "pricepercent": 0.51099998,
//     "winpercent": 67.602936
//   },
//   {
//     "competitorname": "One dime",
//     "chocolate": 0,
//     "fruity": 0,
//     "caramel": 0,
//     "peanutyalmondy": 0,
//     "nougat": 0,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 0,
//     "pluribus": 0,
//     "sugarpercent": 0.011,
//     "pricepercent": 0.116,
//     "winpercent": 32.261086
//   },
//   {
//     "competitorname": "One quarter",
//     "chocolate": 0,
//     "fruity": 0,
//     "caramel": 0,
//     "peanutyalmondy": 0,
//     "nougat": 0,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 0,
//     "pluribus": 0,
//     "sugarpercent": 0.011,
//     "pricepercent": 0.51099998,
//     "winpercent": 46.116505
//   },
//   {
//     "competitorname": "Air Heads",
//     "chocolate": 0,
//     "fruity": 1,
//     "caramel": 0,
//     "peanutyalmondy": 0,
//     "nougat": 0,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 0,
//     "pluribus": 0,
//     "sugarpercent": 0.90600002,
//     "pricepercent": 0.51099998,
//     "winpercent": 52.341465
//   },
//   {
//     "competitorname": "Almond Joy",
//     "chocolate": 1,
//     "fruity": 0,
//     "caramel": 0,
//     "peanutyalmondy": 1,
//     "nougat": 0,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.465,
//     "pricepercent": 0.76700002,
//     "winpercent": 50.347546
//   },
//   {
//     "competitorname": "Baby Ruth",
//     "chocolate": 1,
//     "fruity": 0,
//     "caramel": 1,
//     "peanutyalmondy": 1,
//     "nougat": 1,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.60399997,
//     "pricepercent": 0.76700002,
//     "winpercent": 56.914547
//   },
//   {
//     "competitorname": "Boston Baked Beans",
//     "chocolate": 0,
//     "fruity": 0,
//     "caramel": 0,
//     "peanutyalmondy": 1,
//     "nougat": 0,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 0,
//     "pluribus": 1,
//     "sugarpercent": 0.31299999,
//     "pricepercent": 0.51099998,
//     "winpercent": 23.417824
//   },
//   {
//     "competitorname": "Candy Corn",
//     "chocolate": 0,
//     "fruity": 0,
//     "caramel": 0,
//     "peanutyalmondy": 0,
//     "nougat": 0,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.90600002,
//     "pricepercent": 0.32499999,
//     "winpercent": 38.010963
//   },
//   {
//     "competitorname": "Caramel Apple Pops",
//     "chocolate": 0,
//     "fruity": 1,
//     "caramel": 1,
//     "peanutyalmondy": 0,
//     "nougat": 0,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 0,
//     "pluribus": 0,
//     "sugarpercent": 0.60399997,
//     "pricepercent": 0.32499999,
//     "winpercent": 34.517681
//   },
//   {
//     "competitorname": "Charleston Chew",
//     "chocolate": 1,
//     "fruity": 0,
//     "caramel": 0,
//     "peanutyalmondy": 0,
//     "nougat": 1,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.60399997,
//     "pricepercent": 0.51099998,
//     "winpercent": 38.975037
//   },
//   {
//     "competitorname": "Chewey Lemonhead Fruit Mix",
//     "chocolate": 0,
//     "fruity": 1,
//     "caramel": 0,
//     "peanutyalmondy": 0,
//     "nougat": 0,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.73199999,
//     "pricepercent": 0.51099998,
//     "winpercent": 36.017628
//   },
//   {
//     "competitorname": "Chiclets",
//     "chocolate": 0,
//     "fruity": 1,
//     "caramel": 0,
//     "peanutyalmondy": 0,
//     "nougat": 0,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.046,
//     "pricepercent": 0.32499999,
//     "winpercent": 24.524988
//   },
//   {
//     "competitorname": "Dots",
//     "chocolate": 0,
//     "fruity": 1,
//     "caramel": 0,
//     "peanutyalmondy": 0,
//     "nougat": 0,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.73199999,
//     "pricepercent": 0.51099998,
//     "winpercent": 42.272076
//   },
//   {
//     "competitorname": "Dum Dums",
//     "chocolate": 0,
//     "fruity": 1,
//     "caramel": 0,
//     "peanutyalmondy": 0,
//     "nougat": 0,
//     "crispedricewafer": 1,
//     "hard": 0,
//     "bar": 0,
//     "pluribus": 0,
//     "sugarpercent": 0.73199999,
//     "pricepercent": 0.034000002,
//     "winpercent": 39.460556
//   },
//   {
//     "competitorname": "Fruit Chews",
//     "chocolate": 0,
//     "fruity": 1,
//     "caramel": 0,
//     "peanutyalmondy": 0,
//     "nougat": 0,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.127,
//     "pricepercent": 0.034000002,
//     "winpercent": 43.088924
//   },
//   {
//     "competitorname": "Fun Dip",
//     "chocolate": 0,
//     "fruity": 1,
//     "caramel": 0,
//     "peanutyalmondy": 0,
//     "nougat": 0,
//     "crispedricewafer": 1,
//     "hard": 0,
//     "bar": 0,
//     "pluribus": 0,
//     "sugarpercent": 0.73199999,
//     "pricepercent": 0.32499999,
//     "winpercent": 39.185505
//   },
//   {
//     "competitorname": "Gobstopper",
//     "chocolate": 0,
//     "fruity": 1,
//     "caramel": 0,
//     "peanutyalmondy": 0,
//     "nougat": 0,
//     "crispedricewafer": 1,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.90600002,
//     "pricepercent": 0.45300001,
//     "winpercent": 46.783348
//   },
//   {
//     "competitorname": "Haribo Gold Bears",
//     "chocolate": 0,
//     "fruity": 1,
//     "caramel": 0,
//     "peanutyalmondy": 0,
//     "nougat": 0,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.465,
//     "pricepercent": 0.465,
//     "winpercent": 57.11974
//   },
//   {
//     "competitorname": "Haribo Happy Cola",
//     "chocolate": 0,
//     "fruity": 0,
//     "caramel": 0,
//     "peanutyalmondy": 0,
//     "nougat": 0,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.465,
//     "pricepercent": 0.465,
//     "winpercent": 34.158958
//   },
//   {
//     "competitorname": "Haribo Sour Bears",
//     "chocolate": 0,
//     "fruity": 1,
//     "caramel": 0,
//     "peanutyalmondy": 0,
//     "nougat": 0,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.465,
//     "pricepercent": 0.465,
//     "winpercent": 51.41243
//   },
//   {
//     "competitorname": "Haribo Twin Snakes",
//     "chocolate": 0,
//     "fruity": 1,
//     "caramel": 0,
//     "peanutyalmondy": 0,
//     "nougat": 0,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.465,
//     "pricepercent": 0.465,
//     "winpercent": 42.178772
//   },
//   {
//     "competitorname": "Hershey's Kisses",
//     "chocolate": 1,
//     "fruity": 0,
//     "caramel": 0,
//     "peanutyalmondy": 0,
//     "nougat": 0,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.127,
//     "pricepercent": 0.093000002,
//     "winpercent": 55.375454
//   },
//   {
//     "competitorname": "Hershey's Krackel",
//     "chocolate": 1,
//     "fruity": 0,
//     "caramel": 0,
//     "peanutyalmondy": 0,
//     "nougat": 0,
//     "crispedricewafer": 1,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.43000001,
//     "pricepercent": 0.91799998,
//     "winpercent": 62.284481
//   },
//   {
//     "competitorname": "Hershey's Milk Chocolate",
//     "chocolate": 1,
//     "fruity": 0,
//     "caramel": 0,
//     "peanutyalmondy": 0,
//     "nougat": 0,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.43000001,
//     "pricepercent": 0.91799998,
//     "winpercent": 56.490501
//   },
//   {
//     "competitorname": "Hershey's Special Dark",
//     "chocolate": 1,
//     "fruity": 0,
//     "caramel": 0,
//     "peanutyalmondy": 0,
//     "nougat": 0,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.43000001,
//     "pricepercent": 0.91799998,
//     "winpercent": 59.236122
//   },
//   {
//     "competitorname": "Jawbusters",
//     "chocolate": 0,
//     "fruity": 1,
//     "caramel": 0,
//     "peanutyalmondy": 0,
//     "nougat": 0,
//     "crispedricewafer": 1,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.093000002,
//     "pricepercent": 0.51099998,
//     "winpercent": 28.127439
//   },
//   {
//     "competitorname": "Junior Mints",
//     "chocolate": 1,
//     "fruity": 0,
//     "caramel": 0,
//     "peanutyalmondy": 0,
//     "nougat": 0,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.197,
//     "pricepercent": 0.51099998,
//     "winpercent": 57.21925
//   },
//   {
//     "competitorname": "Kit Kat",
//     "chocolate": 1,
//     "fruity": 0,
//     "caramel": 0,
//     "peanutyalmondy": 0,
//     "nougat": 0,
//     "crispedricewafer": 1,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.31299999,
//     "pricepercent": 0.51099998,
//     "winpercent": 76.7686
//   },
//   {
//     "competitorname": "Laffy Taffy",
//     "chocolate": 0,
//     "fruity": 1,
//     "caramel": 0,
//     "peanutyalmondy": 0,
//     "nougat": 0,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 0,
//     "pluribus": 0,
//     "sugarpercent": 0.22,
//     "pricepercent": 0.116,
//     "winpercent": 41.389557
//   },
//   {
//     "competitorname": "Lemonhead",
//     "chocolate": 0,
//     "fruity": 1,
//     "caramel": 0,
//     "peanutyalmondy": 0,
//     "nougat": 0,
//     "crispedricewafer": 1,
//     "hard": 0,
//     "bar": 0,
//     "pluribus": 0,
//     "sugarpercent": 0.046,
//     "pricepercent": 0.104,
//     "winpercent": 39.141056
//   },
//   {
//     "competitorname": "Lifesavers big ring gummies",
//     "chocolate": 0,
//     "fruity": 1,
//     "caramel": 0,
//     "peanutyalmondy": 0,
//     "nougat": 0,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 0,
//     "pluribus": 0,
//     "sugarpercent": 0.26699999,
//     "pricepercent": 0.27900001,
//     "winpercent": 52.911392
//   },
//   {
//     "competitorname": "Peanut butter M&M's",
//     "chocolate": 1,
//     "fruity": 0,
//     "caramel": 0,
//     "peanutyalmondy": 1,
//     "nougat": 0,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.82499999,
//     "pricepercent": 0.65100002,
//     "winpercent": 71.46505
//   },
//   {
//     "competitorname": "M&M's",
//     "chocolate": 1,
//     "fruity": 0,
//     "caramel": 0,
//     "peanutyalmondy": 0,
//     "nougat": 0,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.82499999,
//     "pricepercent": 0.65100002,
//     "winpercent": 66.574585
//   },
//   {
//     "competitorname": "Mike & Ike",
//     "chocolate": 0,
//     "fruity": 1,
//     "caramel": 0,
//     "peanutyalmondy": 0,
//     "nougat": 0,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.87199998,
//     "pricepercent": 0.32499999,
//     "winpercent": 46.411716
//   },
//   {
//     "competitorname": "Milk Duds",
//     "chocolate": 1,
//     "fruity": 0,
//     "caramel": 1,
//     "peanutyalmondy": 0,
//     "nougat": 0,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.30199999,
//     "pricepercent": 0.51099998,
//     "winpercent": 55.064072
//   },
//   {
//     "competitorname": "Milky Way",
//     "chocolate": 1,
//     "fruity": 0,
//     "caramel": 1,
//     "peanutyalmondy": 0,
//     "nougat": 1,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.60399997,
//     "pricepercent": 0.65100002,
//     "winpercent": 73.099556
//   },
//   {
//     "competitorname": "Milky Way Midnight",
//     "chocolate": 1,
//     "fruity": 0,
//     "caramel": 1,
//     "peanutyalmondy": 0,
//     "nougat": 1,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.73199999,
//     "pricepercent": 0.44100001,
//     "winpercent": 60.800701
//   },
//   {
//     "competitorname": "Milky Way Simply Caramel",
//     "chocolate": 1,
//     "fruity": 0,
//     "caramel": 1,
//     "peanutyalmondy": 0,
//     "nougat": 0,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.96499997,
//     "pricepercent": 0.86000001,
//     "winpercent": 64.35334
//   },
//   {
//     "competitorname": "Mounds",
//     "chocolate": 1,
//     "fruity": 0,
//     "caramel": 0,
//     "peanutyalmondy": 0,
//     "nougat": 0,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.31299999,
//     "pricepercent": 0.86000001,
//     "winpercent": 47.829754
//   },
//   {
//     "competitorname": "Mr Good Bar",
//     "chocolate": 1,
//     "fruity": 0,
//     "caramel": 0,
//     "peanutyalmondy": 1,
//     "nougat": 0,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.31299999,
//     "pricepercent": 0.91799998,
//     "winpercent": 54.526451
//   },
//   {
//     "competitorname": "Nerds",
//     "chocolate": 0,
//     "fruity": 1,
//     "caramel": 0,
//     "peanutyalmondy": 0,
//     "nougat": 0,
//     "crispedricewafer": 1,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.84799999,
//     "pricepercent": 0.32499999,
//     "winpercent": 55.354046
//   },
//   {
//     "competitorname": "Nestle Butterfinger",
//     "chocolate": 1,
//     "fruity": 0,
//     "caramel": 0,
//     "peanutyalmondy": 1,
//     "nougat": 0,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.60399997,
//     "pricepercent": 0.76700002,
//     "winpercent": 70.735641
//   },
//   {
//     "competitorname": "Nestle Crunch",
//     "chocolate": 1,
//     "fruity": 0,
//     "caramel": 0,
//     "peanutyalmondy": 0,
//     "nougat": 0,
//     "crispedricewafer": 1,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.31299999,
//     "pricepercent": 0.76700002,
//     "winpercent": 66.47068
//   },
//   {
//     "competitorname": "Nik L Nip",
//     "chocolate": 0,
//     "fruity": 1,
//     "caramel": 0,
//     "peanutyalmondy": 0,
//     "nougat": 0,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.197,
//     "pricepercent": 0.97600001,
//     "winpercent": 22.445341
//   },
//   {
//     "competitorname": "Now & Later",
//     "chocolate": 0,
//     "fruity": 1,
//     "caramel": 0,
//     "peanutyalmondy": 0,
//     "nougat": 0,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.22,
//     "pricepercent": 0.32499999,
//     "winpercent": 39.4468
//   },
//   {
//     "competitorname": "Payday",
//     "chocolate": 0,
//     "fruity": 0,
//     "caramel": 0,
//     "peanutyalmondy": 1,
//     "nougat": 1,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.465,
//     "pricepercent": 0.76700002,
//     "winpercent": 46.296597
//   },
//   {
//     "competitorname": "Peanut M&Ms",
//     "chocolate": 1,
//     "fruity": 0,
//     "caramel": 0,
//     "peanutyalmondy": 1,
//     "nougat": 0,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.59299999,
//     "pricepercent": 0.65100002,
//     "winpercent": 69.483788
//   },
//   {
//     "competitorname": "Pixie Sticks",
//     "chocolate": 0,
//     "fruity": 0,
//     "caramel": 0,
//     "peanutyalmondy": 0,
//     "nougat": 0,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.093000002,
//     "pricepercent": 0.023,
//     "winpercent": 37.722336
//   },
//   {
//     "competitorname": "Pop Rocks",
//     "chocolate": 0,
//     "fruity": 1,
//     "caramel": 0,
//     "peanutyalmondy": 0,
//     "nougat": 0,
//     "crispedricewafer": 1,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.60399997,
//     "pricepercent": 0.83700001,
//     "winpercent": 41.265511
//   },
//   {
//     "competitorname": "Red vines",
//     "chocolate": 0,
//     "fruity": 1,
//     "caramel": 0,
//     "peanutyalmondy": 0,
//     "nougat": 0,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 1,
//     "pluribus": 0,
//     "sugarpercent": 0.58099997,
//     "pricepercent": 0.116,
//     "winpercent": 37.348522
//   },
//   {
//     "competitorname": "Reese's Miniatures",
//     "chocolate": 1,
//     "fruity": 0,
//     "caramel": 0,
//     "peanutyalmondy": 1,
//     "nougat": 0,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 0,
//     "pluribus": 0,
//     "sugarpercent": 0.034000002,
//     "pricepercent": 0.27900001,
//     "winpercent": 81.866257
//   },
//   {
//     "competitorname": "Reese's Peanut Butter cup",
//     "chocolate": 1,
//     "fruity": 0,
//     "caramel": 0,
//     "peanutyalmondy": 1,
//     "nougat": 0,
//     "crispedricewafer": 0,
//     "hard": 0,
//     "bar": 0,
//     "pluribus": 0,
//     "sugarpercent": 0.72000003,
//     "pricepercent": 0.65100,
//     "winpercent": 81.866257
//   }
// ];

// /** 
//  * Function that calls the full_analysis endpoint. 
//  * We pass in the data + user question, and get back 
//  * generated_code, summary, parameterized_summary, chart_data.
//  */
// async function callFullAnalysisEndpoint(userQuestion: string) {
//   const payload = {
//     data: FINANCIAL_DATA,
//     question: userQuestion,
//   };

//   const response = await fetch("http://127.0.0.1:8000/full_analysis", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload),
//   });

//   if (!response.ok) {
//     throw new Error("Failed to fetch from /full_analysis");
//   }
//   return await response.json();
// }

// interface AIThreadViewProps {
//   threadId: string;
//   threadType: ThreadType;
// }

// /**
//  * This component now uses the /full_analysis endpoint in handleSendMessage.
//  * It no longer calls /analysis or /execute_code directly.
//  */
// export function AIThreadView({ threadId }: AIThreadViewProps) {
//   const { createMessage, markAsRead, threads, messages } = useContext(ChatContext);
//   const messagesRef = useRef<HTMLDivElement>(null);

//   const handleSendMessage = useCallback(
//     async (type: MessageType, content: string) => {
//       // Create the user's question message.
//       createMessage({
//         threadId,
//         type: "text",
//         content,
//       });

//       try {
//         const analysisResponse = await callFullAnalysisEndpoint(content);
      
//         const generatedCode = analysisResponse.generated_code;
//         const summary = analysisResponse.summary || "No summary";
//         const parameterizedSummary = analysisResponse.parameterized_summary || "No parameterized summary";
//         // This is the array of objects (e.g. [{ "sector": "...", "revenue": ... }, ...])
//         const chartData = analysisResponse.chart_data || [];
//         console.log(chartData)
      
//         // Build the content string you display in chat
//         const finalMessage =
//           `Summary:\n${summary}`;
//           // `Parameterized Summary:\n${parameterizedSummary}\n\n` +
//           // `Chart Data:\n${JSON.stringify(chartData, null, 2)}`;
      
//         // IMPORTANT: put chartData in the message object
//         createMessage({
//           threadId,
//           type: "llm",
//           content: finalMessage,
//           sql: generatedCode,
//           chartData: chartData // <-- Must attach it here
//         });
//       } catch (error: any) {
//         createMessage({
//           threadId,
//           type: "llm",
//           content: `Error: ${error.message}`,
//           sql: "",
//         });
//       }
//     },
//     [threadId, createMessage]
//   );

//   useEffect(() => {
//     markAsRead(threadId);
//   }, [threadId, markAsRead]);

//   useEffect(() => {
//     if (messagesRef.current) {
//       messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
//     }
//   });

//   const thread = threads.find((t) => t.id === threadId);
//   const threadMessages = messages.get(threadId) ?? [];

//   if (!thread) {
//     return (
//       <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
//         <Typography color="textSecondary" variant="h6">
//           Thread not found
//         </Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box
//       sx={{
//         display: "flex",
//         flexDirection: "column",
//         height: "100vh",
//         overflow: "hidden",
//       }}
//     >
//       <Box sx={{ flex: "0 0 auto", borderBottom: "1px solid #ccc" }}>
//         <ThreadToolbar thread={thread} />
//       </Box>

//       <Box ref={messagesRef} sx={{ flex: "1 1 auto", overflowY: "auto", p: 2 }}>
//         <Stack spacing={2}>
//           {threadMessages.map((msg) => (
//             <MessageBox key={msg.id} message={msg} />
//           ))}
//         </Stack>
//       </Box>

//       <Box sx={{ flex: "0 0 auto", borderTop: "1px solid #ccc", p: 2 }}>
//         <MessageAdd onSend={handleSendMessage} />
//       </Box>
//     </Box>
//   );
// }

// "use client";

// import React, { useCallback, useContext, useEffect, useRef } from "react";
// import { Box, Stack, Typography } from "@mui/material";
// import { ChatContext } from "./chat-context";
// import { MessageAdd } from "./message-add";
// import { MessageBox } from "./message-box";
// import { ThreadToolbar } from "./thread-toolbar";
// import type { MessageType, ThreadType } from "./types";
// import {FINANCIAL_DATA, FINANCIAL_DATA_, DATA_PROFILE,DATA_PROFILE_SYNTH,FINANCIAL_DATA_SYNTH } from "./data/financial_data"



// interface AIThreadViewProps {
//   threadId: string;
//   threadType: ThreadType;
// }

// export function AIThreadView({ threadId }: AIThreadViewProps) {
//   const { createMessage, markAsRead, threads, messages } = React.useContext(ChatContext);
//   const messagesRef = React.useRef<HTMLDivElement>(null);

//   // Pre-load the dataset profile bubble if no messages exist yet
//   React.useEffect(() => {
//     const threadMessages = messages.get(threadId) ?? [];
//     if (threadMessages.length === 0) {
//       createMessage({
//         threadId,
//         type: "llm",
//         content: "Dataset profiling result. Below are the charts and data profile.",
//         sql: "SQL placeholder",
//         profile: DATA_PROFILE,          
//         profileSynth: DATA_PROFILE_SYNTH
//       });
//     }
//   }, [messages, threadId, createMessage]);

//   const handleSendMessage = React.useCallback(
//     async (type: MessageType, content: string) => {
//       createMessage({
//         threadId,
//         type: "text",
//         content,
//       });

//       try {
//         const response = await fetch("http://127.0.0.1:8000/full_analysis", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             data: FINANCIAL_DATA_SYNTH,
//             question: content,
//           }),
//         });
//         if (!response.ok) {
//           throw new Error("Failed to fetch from /full_analysis");
//         }
//         const analysisResponse = await response.json();
//         const generatedCode = analysisResponse.generated_code;
//         const summary = analysisResponse.summary || "No summary";
//         const chartData = analysisResponse.chart_data || [];
//         const parameterized_summary = analysisResponse.parameterized_summary || "No summary";
        

//         const finalMessage = `Summary:\n${summary}`;
//         createMessage({
//           threadId,
//           type: "llm",
//           content: finalMessage,
//           sql: generatedCode,
//           chartData: chartData,
//           parameterizedSummary:parameterized_summary
//         });
//       } catch (error: any) {
//         createMessage({
//           threadId,
//           type: "llm",
//           content: `Error: ${error.message}`,
//           sql: "",
//         });
//       }
//     },
//     [threadId, createMessage]
//   );

//   React.useEffect(() => {
//     markAsRead(threadId);
//   }, [threadId, markAsRead]);

//   React.useEffect(() => {
//     if (messagesRef.current) {
//       messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
//     }
//   });

//   const thread = threads.find((t) => t.id === threadId);
//   const threadMessages = messages.get(threadId) ?? [];

//   if (!thread) {
//     return (
//       <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
//         <Typography color="textSecondary" variant="h6">
//           Thread not found
//         </Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
//       <Box sx={{ flex: "0 0 auto", borderBottom: "1px solid #ccc" }}>
//         <ThreadToolbar thread={thread} />
//       </Box>
//       <Box ref={messagesRef} sx={{ flex: "1 1 auto", overflowY: "auto", p: 2 }}>
//         <Stack spacing={2}>
//           {threadMessages.map((msg) => (
//             <MessageBox key={msg.id} message={msg} />
//           ))}
//         </Stack>
//       </Box>
//       <Box sx={{ flex: "0 0 auto", borderTop: "1px solid #ccc", p: 2 }}>
//         <MessageAdd onSend={handleSendMessage} />
//       </Box>
//     </Box>
//   );
// }

// ai-thread-view.tsx
// 'use client';

// import React, { useCallback, useContext, useEffect, useRef } from 'react';
// import { Box, Stack, Typography } from '@mui/material';

// import { ChatContext } from './chat-context';
// import { MessageAdd } from './message-add';
// import { MessageBox } from './message-box';
// import { ThreadToolbar } from './thread-toolbar';
// import type { MessageType, ThreadType } from './types';
// import {FINANCIAL_DATA, FINANCIAL_DATA_, DATA_PROFILE,DATA_PROFILE_SYNTH,FINANCIAL_DATA_SYNTH } from "./data/financial_data"

// import { SchemaContext } from '@/components/dashboard/layout/SchemaContext';  // 🔸 NEW

// /* fallback sample data */
// // export const FINANCIAL_DATA_SYNTH: Record<string, unknown>[] = [];

// /* dataset‑profiling placeholders */
// // const DATA_PROFILE = {};
// // const DATA_PROFILE_SYNTH = {};

// interface AIThreadViewProps {
//   threadId: string;
//   threadType: ThreadType;
// }

// export function AIThreadView({ threadId }: AIThreadViewProps) {
//   const { createMessage, markAsRead, threads, messages } = useContext(ChatContext);
//   const { selectedSchemaName } = useContext(SchemaContext);               // 🔸 NEW
//   const messagesRef = useRef<HTMLDivElement>(null);

//   /* preload first bubble */
//   useEffect(() => {
//     const threadMessages = messages.get(threadId) ?? [];
//     if (threadMessages.length === 0) {
//       createMessage({
//         threadId,
//         type: 'llm',
//         content: 'Dataset profiling result. Below are the charts and data profile.',
//         sql: 'SQL placeholder',
//         profile: DATA_PROFILE,
//         profileSynth: DATA_PROFILE_SYNTH,
//       });
//     }
//   }, [messages, threadId, createMessage]);

//   /* -------- prepare data to send on each question ------------------ */
//   const getSelectedData = useCallback((): unknown => {
//     if (!selectedSchemaName) return FINANCIAL_DATA_SYNTH;
//     try {
//       const raw = localStorage.getItem(selectedSchemaName);
//       if (!raw) return FINANCIAL_DATA_SYNTH;
//       return JSON.parse(raw);           // return parsed JSON “as is”
//     } catch {
//       return FINANCIAL_DATA_SYNTH;      // fallback if parse fails
//     }
//   }, [selectedSchemaName]);

//   /* send message & call /full_analysis -------------------------------- */
//   const handleSendMessage = useCallback(
//     async (type: MessageType, content: string) => {
//       createMessage({ threadId, type: 'text', content });

//       const payload = {
//         data: getSelectedData(),        // 🔸 use selected file
//         question: content,
//       };

//       try {
//         const res = await fetch('http://127.0.0.1:8000/full_analysis', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(payload),
//         });
//         if (!res.ok) throw new Error('Failed to fetch from /full_analysis');

//         const {
//           generated_code: sql = '',
//           summary = 'No summary',
//           chart_data: chartData = [],
//           parameterized_summary: parameterizedSummary = 'No summary',
//         } = await res.json();

//         createMessage({
//           threadId,
//           type: 'llm',
//           content: `Summary:\n${summary}`,
//           sql,
//           chartData,
//           parameterizedSummary,
//         });
//       } catch (err: any) {
//         createMessage({
//           threadId,
//           type: 'llm',
//           content: `Error: ${err.message}`,
//           sql: '',
//         });
//       }
//     },
//     [threadId, createMessage, getSelectedData]
//   );

//   /* mark thread as read */
//   useEffect(() => {
//     markAsRead(threadId);
//   }, [threadId, markAsRead]);

//   /* auto‑scroll */
//   useEffect(() => {
//     messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight });
//   }, [messages, threadId]);

//   const thread = threads.find((t) => t.id === threadId);
//   const threadMessages = messages.get(threadId) ?? [];

//   if (!thread) {
//     return (
//       <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//         <Typography color="textSecondary" variant="h6">
//           Thread not found
//         </Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
//       <Box sx={{ flex: '0 0 auto', borderBottom: '1px solid #ccc' }}>
//         <ThreadToolbar thread={thread} />
//       </Box>

//       <Box ref={messagesRef} sx={{ flex: '1 1 auto', overflowY: 'auto', p: 2 }}>
//         <Stack spacing={2}>
//           {threadMessages.map((msg) => (
//             <MessageBox key={msg.id} message={msg} />
//           ))}
//         </Stack>
//       </Box>

//       <Box sx={{ flex: '0 0 auto', borderTop: '1px solid #ccc', p: 2 }}>
//         <MessageAdd onSend={handleSendMessage} />
//       </Box>
//     </Box>
//   );
// }
/* app/components/AIThreadView.tsx */
// 'use client';

// import React, { useCallback, useContext, useEffect, useRef } from 'react';
// import { Box, Stack, Typography } from '@mui/material';

// import { ChatContext } from './chat-context';
// import { MessageAdd } from './message-add';
// import { MessageBox } from './message-box';
// import { ThreadToolbar } from './thread-toolbar';
// import type { MessageType, ThreadType } from './types';

// import {
//   FINANCIAL_DATA,                   // (still used elsewhere)
//   FINANCIAL_DATA_,                  // (legacy import, keep if needed)
//   DATA_PROFILE_SYNTH,               // fallback / synthetic profile
//   FINANCIAL_DATA_SYNTH,             // fallback synthetic data
// } from './data/financial_data';

// import { SchemaContext } from '@/components/dashboard/layout/SchemaContext';

// /* ------------------------------------------------------------------ */

// interface AIThreadViewProps {
//   threadId: string;
//   threadType: ThreadType;
// }

// export function AIThreadView({ threadId }: AIThreadViewProps) {
//   const { createMessage, markAsRead, threads, messages } = useContext(ChatContext);
//   const { selectedSchemaName } = useContext(SchemaContext);
//   const messagesRef = useRef<HTMLDivElement>(null);

//   /* --------------------------------------------------------------- */
//   /* 1️⃣  First‑time bubble: fetch live profile from FastAPI          */
//   /* --------------------------------------------------------------- */
//   useEffect(() => {
//     const threadMessages = messages.get(threadId) ?? [];
//     if (threadMessages.length === 0) {
//       (async () => {
//         try {
//           const res = await fetch('http://127.0.0.1:8000/profile_data');
//           if (!res.ok) throw new Error(`HTTP ${res.status}`);
//           const profile = await res.json();

//           createMessage({
//             threadId,
//             type: 'llm',
//             content: 'Dataset profiling result. Below are the charts and data profile.',
//             sql: 'SQL placeholder',
//             profile,                 // ✅ live profile injected here
//             profileSynth: DATA_PROFILE_SYNTH,
//           });
//         } catch (err: any) {
//           createMessage({
//             threadId,
//             type: 'llm',
//             content: `Could not fetch dataset profile: ${err.message}`,
//             sql: '',
//           });
//         }
//       })();
//     }
//   }, [messages, threadId, createMessage]);

//   /* --------------------------------------------------------------- */
//   /* 2️⃣  Data selector for /full_analysis                            */
//   /* --------------------------------------------------------------- */
//   const getSelectedData = useCallback((): unknown => {
//     if (!selectedSchemaName) return FINANCIAL_DATA_SYNTH;
//     try {
//       const raw = localStorage.getItem(selectedSchemaName);
//       if (!raw) return FINANCIAL_DATA_SYNTH;
//       return JSON.parse(raw);
//     } catch {
//       return FINANCIAL_DATA_SYNTH;
//     }
//   }, [selectedSchemaName]);

//   /* --------------------------------------------------------------- */
//   /* 3️⃣  Send message → call /full_analysis                          */
//   /* --------------------------------------------------------------- */
//   const handleSendMessage = useCallback(
//     async (type: MessageType, content: string) => {
//       createMessage({ threadId, type: 'text', content });

//       const payload = {
//         data: getSelectedData(),
//         question: content,
//       };

//       try {
//         const res = await fetch('http://127.0.0.1:8000/full_analysis', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(payload),
//         });
//         if (!res.ok) throw new Error('Failed to fetch from /full_analysis');

//         const {
//           generated_code: sql = '',
//           summary = 'No summary',
//           chart_data: chartData = [],
//           parameterized_summary: parameterizedSummary = 'No summary',
//         } = await res.json();

//         createMessage({
//           threadId,
//           type: 'llm',
//           content: `Summary:\n${summary}`,
//           sql,
//           chartData,
//           parameterizedSummary,
//         });
//       } catch (err: any) {
//         createMessage({
//           threadId,
//           type: 'llm',
//           content: `Error: ${err.message}`,
//           sql: '',
//         });
//       }
//     },
//     [threadId, createMessage, getSelectedData],
//   );

//   /* --------------------------------------------------------------- */
//   /* 4️⃣  Misc: mark as read + auto‑scroll                            */
//   /* --------------------------------------------------------------- */
//   useEffect(() => markAsRead(threadId), [threadId, markAsRead]);

//   useEffect(() => {
//     messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight });
//   }, [messages, threadId]);

//   /* --------------------------------------------------------------- */
//   /* 5️⃣  Render                                                     */
//   /* --------------------------------------------------------------- */
//   const thread = threads.find((t) => t.id === threadId);
//   const threadMessages = messages.get(threadId) ?? [];

//   if (!thread) {
//     return (
//       <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//         <Typography color="textSecondary" variant="h6">
//           Thread not found
//         </Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
//       <Box sx={{ flex: '0 0 auto', borderBottom: '1px solid #ccc' }}>
//         <ThreadToolbar thread={thread} />
//       </Box>

//       <Box ref={messagesRef} sx={{ flex: '1 1 auto', overflowY: 'auto', p: 2 }}>
//         <Stack spacing={2}>
//           {threadMessages.map((msg) => (
//             <MessageBox key={msg.id} message={msg} />
//           ))}
//         </Stack>
//       </Box>

//       <Box sx={{ flex: '0 0 auto', borderTop: '1px solid #ccc', p: 2 }}>
//         <MessageAdd onSend={handleSendMessage} />
//       </Box>
//     </Box>
//   );
// }
/* app/components/AIThreadView.tsx */
'use client';

import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';

import { ChatContext } from './chat-context';
import { MessageAdd } from './message-add';
import { MessageBox } from './message-box';
import { ThreadToolbar } from './thread-toolbar';
import type { MessageType, ThreadType } from './types';
import { SchemaContext } from '@/components/dashboard/layout/SchemaContext';

/* ----------------------- helpers ----------------------- */
async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return res.json() as Promise<T>;
}

/* ------------------------------------------------------- */

interface AIThreadViewProps {
  threadId: string;
  threadType: ThreadType;
}

export function AIThreadView({ threadId }: AIThreadViewProps) {
  const { createMessage, markAsRead, threads, messages } = useContext(ChatContext);
  const { selectedSchemaName } = useContext(SchemaContext);
  const messagesRef = useRef<HTMLDivElement>(null);

  /* cached original data in state (so we don't hit the API every keystroke) */
  const [originalData, setOriginalData] = useState<unknown[]>([]);

  /* -------- 1️⃣  bootstrap first bubble -------------------------------- */
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const { original_profile, synthetic_profile } = await fetchJSON<{
          original_profile: unknown;
          synthetic_profile: unknown | null;
        }>('http://127.0.0.1:8000/profiles');

        createMessage({
          threadId,
          type: 'llm',
          content:
            'Dataset profiling result. Below are the charts and data profile.',
          sql: 'SQL placeholder',
          profile: original_profile,
          profileSynth: synthetic_profile,
        });
      } catch (e: any) {
        createMessage({
          threadId,
          type: 'llm',
          content: `Could not fetch profiles: ${e.message}`,
          sql: '',
        });
      }
    };

    if ((messages.get(threadId) ?? []).length === 0) bootstrap();
  }, [messages, threadId, createMessage]);

  /* -------- 2️⃣  load original dataset once ----------------------------- */
  useEffect(() => {
    fetchJSON<unknown[]>('http://127.0.0.1:8000/data/original')
      .then(setOriginalData)
      .catch(() => setOriginalData([]));
  }, [selectedSchemaName]);

  /* -------- 3️⃣  send message / call full_analysis ---------------------- */
  const handleSendMessage = useCallback(
    async (_type: MessageType, content: string) => {
      createMessage({ threadId, type: 'text', content });

      try {
        const res = await fetch('http://127.0.0.1:8000/full_analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: originalData, question: content }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const {
          generated_code: sql = '',
          summary = 'No summary',
          chart_data: chartData = [],
          parameterized_summary: parameterizedSummary = 'No summary',
        } = await res.json();

        createMessage({
          threadId,
          type: 'llm',
          content: `Summary:\n${summary}`,
          sql,
          chartData,
          parameterizedSummary,
        });
      } catch (err: any) {
        createMessage({
          threadId,
          type: 'llm',
          content: `Error: ${err.message}`,
          sql: '',
        });
      }
    },
    [threadId, createMessage, originalData],
  );

  /* mark as read + auto‑scroll */
  useEffect(() => markAsRead(threadId), [threadId, markAsRead]);
  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight });
  }, [messages, threadId]);

  /* -------------- UI --------------------------------------------------- */
  const thread = threads.find((t) => t.id === threadId);
  const threadMessages = messages.get(threadId) ?? [];

  if (!thread) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="textSecondary" variant="h6">
          Thread not found
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Box sx={{ flex: '0 0 auto', borderBottom: '1px solid #ccc' }}>
        <ThreadToolbar thread={thread} />
      </Box>

      <Box ref={messagesRef} sx={{ flex: '1 1 auto', overflowY: 'auto', p: 2 }}>
        <Stack spacing={2}>
          {threadMessages.map((msg) => (
            <MessageBox key={msg.id} message={msg} />
          ))}
        </Stack>
      </Box>

      <Box sx={{ flex: '0 0 auto', borderTop: '1px solid #ccc', p: 2 }}>
        <MessageAdd onSend={handleSendMessage} />
      </Box>
    </Box>
  );
}
