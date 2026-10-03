/* ============ FOOD DATA (per 100 g as eaten; USDA FoodData Central SR Legacy values) ============
   y = yield: cooked weight / raw (dry) weight. raw grams = cooked grams / y. */
const F = {};
function food(id,name,cat,k,p,c,f,fib,y,rawLabel){F[id]={id,name,cat,k,p,c,f,fib,y,rawLabel:rawLabel||(y>1.2?'dry':y<1?'raw':'')};}
// carbs
food('white_rice','White rice (jasmine / long-grain), cooked','carb',130,2.7,28.2,0.3,0.4,2.8);
food('brown_rice','Brown rice, cooked','carb',123,2.7,25.6,1.0,1.6,3.0);
food('potato','Russet potato, baked with skin','carb',97,2.6,21.4,0.1,2.3,0.8);
food('red_potato','Red / gold potato, boiled in skin','carb',87,1.9,20.1,0.1,1.8,1.0,'raw');
food('sweet_potato','Sweet potato, roasted with skin','carb',90,2.0,20.7,0.2,3.3,0.9);
food('quinoa','Quinoa, cooked','carb',120,4.4,21.3,1.9,2.8,3.0);
food('pasta','Pasta (regular), cooked','carb',158,5.8,30.9,0.9,1.8,2.3);
food('ww_pasta','Whole-wheat pasta, cooked','carb',124,5.3,26.5,0.5,4.5,2.8);
food('couscous','Couscous, cooked','carb',112,3.8,23.2,0.2,1.4,3.3);
food('barley','Pearl barley, cooked','carb',123,2.3,28.2,0.4,3.8,2.9);
food('rice_noodles','Rice noodles, cooked','carb',108,1.8,24.0,0.2,1.0,3.3);
food('oats','Rolled oats (weigh dry)','carb',379,13.2,67.7,6.5,10.1,1.0,'dry');
food('ww_bread','Whole-wheat bread','carb',247,13.0,41.3,3.4,6.8,1.0,'');
food('corn_tortilla','Corn tortillas (~26 g each)','carb',218,5.7,44.6,2.9,6.3,1.0,'');
food('black_beans','Black beans (canned, drained)','carb',132,8.9,23.7,0.5,8.7,1.0,'');
food('lentils','Lentils, cooked','carb',116,9.0,20.1,0.4,7.9,3.0);
food('chickpeas','Chickpeas (canned, drained)','carb',164,8.9,27.4,2.6,7.6,1.0,'');
food('banana','Banana','carb',89,1.1,22.8,0.3,2.6,1.0,'');
food('berries','Blueberries / mixed berries','carb',57,0.7,14.5,0.3,2.4,1.0,'');
food('butternut','Butternut squash, roasted','carb',40,0.9,10.5,0.1,3.2,0.9);
food('cauli_rice','Cauliflower rice','carb',25,1.9,5.0,0.3,2.0,1.0,'');
// proteins
food('chicken_breast','Chicken breast, cooked','protein',165,31.0,0,3.6,0,0.75);
food('chicken_thigh','Chicken thigh (skinless), cooked','protein',209,26.0,0,10.9,0,0.72);
food('beef93','93% lean ground beef, cooked','protein',209,28.9,0,9.5,0,0.73);
food('turkey93','93% lean ground turkey, cooked','protein',213,27.1,0,11.6,0,0.75);
food('salmon','Salmon, cooked','protein',206,22.1,0,12.4,0,0.8);
food('cod','Cod / white fish, cooked','protein',105,22.8,0,0.9,0,0.8);
food('shrimp','Shrimp, cooked','protein',99,24.0,0.2,0.3,0,0.85);
food('pork_tender','Pork tenderloin, cooked','protein',143,26.2,0,3.5,0,0.75);
food('tofu','Extra-firm tofu','protein',144,17.3,2.8,8.7,2.3,1.0,'');
food('eggs','Whole eggs (1 large ≈ 50 g)','protein',143,12.6,0.7,9.5,0,1.0,'');
food('egg_whites','Liquid egg whites','protein',52,10.9,0.7,0.2,0,1.0,'');
food('greek_yogurt','Nonfat plain Greek yogurt','protein',59,10.2,3.6,0.4,0,1.0,'');
food('cottage','2% cottage cheese','protein',84,11.0,4.3,2.3,0,1.0,'');
food('whey','Whey protein powder (check label)','protein',400,80,8,6,0,1.0,'');
// fats
food('olive_oil','Olive oil','fat',884,0,0,100,0,1.0,'');
food('avocado','Avocado','fat',160,2.0,8.5,14.7,6.7,1.0,'');
food('peanut_butter','Peanut butter','fat',588,25,20,50,6,1.0,'');
food('almonds','Almonds','fat',579,21.2,21.6,49.9,12.5,1.0,'');
food('cheddar','Cheddar, shredded','fat',403,24.9,1.3,33.1,0,1.0,'');
food('feta','Feta','fat',264,14.2,4.1,21.3,0,1.0,'');
food('chia','Chia seeds','fat',486,16.5,42.1,30.7,34.4,1.0,'');
food('sesame_oil','Toasted sesame oil','fat',884,0,0,100,0,1.0,'');
// vegetables & extras (fixed amounts)
food('broccoli','Broccoli','veg',35,2.4,7.2,0.4,3.3,1.0,'');
food('green_beans','Green beans','veg',35,1.9,7.9,0.3,3.2,1.0,'');
food('bell_pepper','Bell pepper','veg',31,1.0,6.0,0.3,2.1,1.0,'');
food('onion','Onion','veg',40,1.1,9.3,0.1,1.7,1.0,'');
food('spinach','Spinach','veg',23,2.9,3.6,0.4,2.2,1.0,'');
food('zucchini','Zucchini','veg',17,1.2,3.1,0.3,1.0,1.0,'');
food('brussels','Brussels sprouts','veg',36,2.6,7.1,0.5,2.6,1.0,'');
food('tomato_crushed','Crushed tomatoes (canned)','veg',32,1.6,7.3,0.3,1.9,1.0,'');
food('salsa','Salsa','veg',36,1.5,6.6,0.2,1.9,1.0,'');
food('romaine','Romaine / shredded lettuce','veg',17,1.2,3.3,0.3,2.1,1.0,'');
food('carrot','Carrots','veg',41,0.9,9.6,0.2,2.8,1.0,'');
food('cucumber','Cucumber','veg',15,0.7,3.6,0.1,0.5,1.0,'');
// added for researched recipes
food('ham','Lean ham (check label)','protein',120,19,2,4,0,1.0,'');
food('chicken_sausage','Chicken sausage, cooked (check label)','protein',170,16,3,10,0,1.0,'');
food('turkey99','99% lean ground turkey, cooked','protein',145,31,0,2,0,0.75);
food('flour_tortilla','Flour tortillas (8-inch ≈ 45 g)','carb',304,8,50,7.8,3.5,1.0,'');
food('eng_muffin','Whole-wheat English muffins (≈ 66 g each)','carb',203,8.8,40.4,2.1,6.7,1.0,'');
food('pita','Whole-wheat pita (≈ 64 g each)','carb',262,9.8,55,2.6,7.4,1.0,'');
food('kidney_beans','Kidney beans (canned, drained)','carb',127,8.7,22.8,0.5,6.4,1.0,'');
food('corn','Corn kernels','carb',96,3.4,21,1.5,2.4,1.0,'');
food('gruyere','Gruyère','fat',413,29.8,0.4,32.3,0,1.0,'');
food('parmesan','Parmesan / Pecorino','fat',392,35.8,3.2,25.8,0,1.0,'');
food('mozzarella','Part-skim mozzarella','fat',254,24.3,2.8,15.9,0,1.0,'');
food('coconut_light','Light coconut milk','fat',74,0.6,1.8,7,0,1.0,'');
food('pecans','Pecans','fat',691,9.2,13.9,72,9.6,1.0,'');
food('olives','Kalamata olives','veg',115,0.8,6.3,10.7,3.2,1.0,'');
food('peas','Peas','veg',81,5.4,14.5,0.4,5.1,1.0,'');
food('celery','Celery','veg',16,0.7,3,0.2,1.6,1.0,'');
food('tomato','Tomatoes','veg',18,0.9,3.9,0.2,1.2,1.0,'');
food('tomato_sauce','Tomato sauce (canned)','veg',29,1.3,5.3,0.2,1.5,1.0,'');
food('milk','2% milk','extra',50,3.3,4.8,2,0,1.0,'');
food('almond_milk','Unsweetened almond milk','extra',15,0.6,0.3,1.2,0.2,1.0,'');
food('maple','Maple syrup','extra',260,0,67,0.1,0,1.0,'');
food('honey','Honey','extra',304,0.3,82.4,0,0.2,1.0,'');
food('heavy_cream','Heavy cream','extra',340,2.8,2.7,36,0,1.0,'');
food('pb_muffin','Peanut butter protein muffin (1 ≈ 60 g)','extra',378,16.7,30,21.7,1.5,1.0,'');


const CARBS = Object.values(F).filter(x=>x.cat==='carb');
const PROTEINS = Object.values(F).filter(x=>x.cat==='protein');

/* ============ RECIPES ============ P/C/F = the three solved ingredients. fixed = [food, grams per serving]. */
/* Recipes: each is a well-reviewed published recipe (rating as shown on its page, checked Sep 29 2026),
   adapted to the P/C/F portion solver. `adapt` says what we changed. */
const src=(site,url,rating,count)=>({site,url,rating,count});
const R = {
 /* ---------- breakfasts ---------- */
 burritos:{name:'Freezer breakfast burritos',type:'breakfast',P:'ham',C:'potato',F:'cheddar',fixed:[['eggs',100],['flour_tortilla',45],['onion',20],['bell_pepper',25]],
   src:src('Budget Bytes','https://www.budgetbytes.com/freezer-breakfast-burritos/',4.84,30),
   adapt:'We add diced roasted potato inside (the carb you can swap) and use an 8-inch tortilla.',
   steps:['Soften onion and pepper in a pan; brown the diced ham. Roast diced potatoes at 425 °F about 25 min.','Scramble the eggs softly and pull them while still a little wet, so they don\'t dry out when reheated.','Fill each tortilla with egg, potato, ham, veg and cheese; fold the sides in and roll tight.','Wrap each in parchment, bag and freeze. Reheat from frozen: microwave on defrost 3–5 min, then 1–2 min on high.'],
   store:'Freezer 3 months.',tip:'Reviewers say the soft-scramble trick is what keeps them from getting rubbery.'},
 egg_muffins:{name:'Veggie egg muffins + toast',type:'breakfast',P:'egg_whites',C:'potato',F:'olive_oil',fixed:[['feta',12],['eggs',50],['ww_bread',40],['spinach',20],['bell_pepper',40],['tomato',30]],
   src:src('Well Plated','https://www.wellplated.com/healthy-breakfast-egg-muffins/',4.86,176),
   adapt:'Served with 1 slice of toast plus roasted potatoes (the swappable carb) so breakfast has real fuel.',
   steps:['Grease a 12-cup muffin tin (or a 9×13 dish) and divide the chopped spinach, peppers and tomatoes into the cups.','Whisk whole eggs, egg whites, salt, pepper, basil and oregano; fill each cup about ¾ full. Top with feta.','Bake at 350 °F for 24–28 min (a 9×13 slab takes 25–30 min; cut into squares).','Cool, then refrigerate 3 days or freeze individually. Microwave 30 s (1–2 min from frozen).'],
   store:'Fridge 3 days, freezer 3 months.',tip:'No muffin tin? Bake it as one slab in a 9×13 dish and cut squares.'},
 baked_oats:{name:'Blueberry baked oatmeal + Greek yogurt',type:'breakfast',P:'greek_yogurt',C:'oats',F:'pecans',fixed:[['berries',40],['milk',40],['eggs',17],['maple',5]],
   src:src('Cookie and Kate','https://cookieandkate.com/baked-oatmeal-recipe/',4.7,532),
   adapt:'Paired with Greek yogurt, as many reviewers do, to bring protein up.',
   steps:['Toast the pecans. Mix oats, pecans, baking powder, cinnamon and salt in one bowl; milk, maple, eggs, melted butter and vanilla in another.','Scatter blueberries in a greased 9-inch dish, spread the oat mix over, then pour the wet mix over the top.','Bake at 375 °F for 42–50 min until golden. Cool and cut into squares.','Pack each square with its yogurt portion. Microwave the oatmeal 45–60 s.'],
   store:'Fridge 4–5 days; squares freeze.',tip:'Weigh the oats dry when you make the batch; the app\'s oat grams are dry weight.'},
 oats:{name:'Protein overnight oats',type:'breakfast',P:'whey',C:'oats',F:'peanut_butter',fixed:[['chia',10],['greek_yogurt',60],['almond_milk',180],['honey',5]],
   src:src('Fit Foodie Finds','https://fitfoodiefinds.com/protein-overnight-oats/',5,5),
   adapt:'Few ratings on the page; it\'s here because it\'s the highest-protein no-cook option. A swirl of peanut butter is the fat lever.',
   steps:['In each jar stir oats, protein powder, Greek yogurt, chia, almond milk, honey, vanilla and a pinch of salt.','Refrigerate at least 2 hours or overnight.','Stir, loosen with a splash of milk, add berries or cinnamon on top.'],
   store:'Fridge up to 5 days (best in 2–3).',tip:'Keep crunchy toppings in a separate bag.'},
 pancakes:{name:'Cottage cheese banana protein pancakes',type:'breakfast',P:'egg_whites',C:'oats',F:'peanut_butter',fixed:[['cottage',60],['eggs',50],['banana',60]],
   src:src('Ambitious Kitchen','https://www.ambitiouskitchen.com/cottage-cheese-banana-oatmeal-protein-pancakes/',4.76,141),
   adapt:'Extra egg whites in the batter for protein; peanut butter on top is the fat lever.',
   steps:['Blend oats, banana, egg, cottage cheese, baking powder, vanilla and cinnamon until smooth.','Cook ¼-cup scoops on a greased griddle over medium-low; flip when bubbles form.','Cool, freeze flat on a tray 30 min, then bag.','Reheat 30–60 s in the microwave or in the toaster; spread the peanut butter on top.'],
   store:'Freezer 3 months.',tip:'Reviewers say they\'re sweet enough without syrup.'},
 hash:{name:'Sheet-pan breakfast hash',type:'breakfast',P:'egg_whites',C:'potato',F:'olive_oil',fixed:[['chicken_sausage',50],['eggs',50],['sweet_potato',60],['bell_pepper',50],['onion',25]],
   src:src('Ambitious Kitchen','https://www.ambitiouskitchen.com/sheet-pan-breakfast-hash/',5,7),
   adapt:'Chicken sausage instead of Italian pork sausage, plus scrambled egg whites to reach your protein.',
   steps:['Dice potatoes, sweet potato, peppers and onion; toss with the oil, garlic powder, paprika, cumin, thyme and salt. Roast at 400 °F for 20 min.','Add sliced sausage and roast 15 min more.','Portion the hash. Add the eggs and egg whites as a quick scramble in the morning, or bake them on the pan for the last 8–10 min.'],
   store:'Hash keeps 3–4 days in the fridge.',tip:'Only 7 ratings, but it\'s the best-balanced savory sheet-pan breakfast we found.'},
 chia:{name:'Chia pudding jars with Greek yogurt',type:'breakfast',P:'greek_yogurt',C:'banana',F:'almonds',fixed:[['chia',25],['milk',60],['maple',4]],
   src:src('Downshiftology','https://downshiftology.com/recipes/meal-prep-chia-pudding/',4.99,50),
   adapt:'We swap part of the milk for Greek yogurt, since the original has only 8 g protein.',
   steps:['Stir chia into milk and yogurt with a little maple and vanilla; wait 15 min.','Stir again to break up clumps, then portion into jars.','Top with sliced banana or berries the morning you eat it.'],
   store:'Fridge 5 days; freezes for weeks.',tip:'Stirring twice is what stops clumping.'},
 sandwiches:{name:'Freezer breakfast sandwiches',type:'breakfast',P:'ham',C:'eng_muffin',F:'avocado',fixed:[['eggs',70],['mozzarella',20]],
   src:src('Natasha\'s Kitchen','https://natashaskitchen.com/freezer-breakfast-sandwiches/',4.98,115),
   adapt:'Whole-wheat English muffins and part-skim cheese; smashed avocado (added when you eat) is the fat lever.',
   steps:['Whisk eggs with a splash of milk; bake in a buttered 9×13 at 350 °F for 18–20 min. Cool and cut into squares.','Toast or broil the English muffin halves 2–4 min.','Stack egg, cheese and ham; wrap each in plastic, then foil or a freezer bag.','Microwave from frozen about 3 min, flipping halfway, or 1 min if thawed.'],
   store:'Fridge 1 week, freezer 2 months.',tip:'Readers say baking the eggs as a slab is the easiest way to feed a crowd.'},
 egg_bake:{name:'Cottage cheese egg bake',type:'breakfast',P:'cottage',C:'potato',F:'parmesan',fixed:[['eggs',70],['ww_bread',40],['spinach',60],['onion',15]],
   src:src('The Real Food Dietitians','https://therealfooddietitians.com/cottage-cheese-egg-bake/',5,75),
   adapt:'Served with 1 slice of toast plus roasted potatoes (the swappable carb).',
   steps:['Whisk eggs with garlic powder, salt and pepper.','Fold in cottage cheese, Parmesan, chopped spinach and onion.','Bake in a greased 9×9 at 375 °F for 30–35 min. Cut into squares.'],
   store:'Fridge 3 days.',tip:'High protein from one dish in about 40 minutes.'},
 /* ---------- mains ---------- */
 bulgogi:{name:'Korean beef rice bowls',type:'main',P:'beef93',C:'brown_rice',F:'sesame_oil',fixed:[['cucumber',50],['onion',20],['broccoli',80]],
   src:src('Skinnytaste','https://www.skinnytaste.com/korean-beef-rice-bowls/',4.95,280),
   adapt:'We add steamed broccoli for volume.',
   steps:['Whisk low-sodium soy, a little brown sugar, sesame oil and pepper flakes.','Brown the beef; add onion, garlic and ginger for a minute.','Pour in the sauce, cover and simmer about 10 min.','Pack over rice with broccoli; add cucumber, scallions and a dab of gochujang when you eat.'],
   store:'Fridge 4 days; freezes 3 months without the cucumber.',tip:'A 20-minute "better than takeout" bowl.'},
 chili:{name:'Healthy turkey chili',type:'main',P:'turkey99',C:'kidney_beans',F:'olive_oil',fixed:[['cheddar',12],['corn',40],['tomato_crushed',130],['bell_pepper',40],['onion',30]],
   src:src('Ambitious Kitchen','https://www.ambitiouskitchen.com/seriously-the-best-healthy-turkey-chili/',4.9,857),
   adapt:'A little cheddar on top; the cooking oil is the fat lever. Beans are the carb; swap to rice or potato if you like.',
   steps:['Soften onion, pepper and garlic in a little oil.','Brown the turkey, then toast chili powder, cumin, oregano and cayenne for a minute.','Add crushed tomatoes, broth, beans and corn; simmer 30–45 min (or slow cooker 6–7 h on low).','Portion; top with cheese when serving.'],
   store:'Fridge 1 week, freezer 3 months.',tip:'One of the highest-rated chilis online, and very high in fiber.'},
 burrito:{name:'Slow cooker chicken taco bowls',type:'main',P:'chicken_breast',C:'white_rice',F:'avocado',fixed:[['cheddar',12],['black_beans',50],['corn',40],['salsa',80]],
   src:src('Budget Bytes','https://www.budgetbytes.com/taco-chicken-bowls/',4.73,238),
   adapt:'Less rice and cheese than the original (651 kcal); avocado is the fat lever.',
   steps:['Put chicken, beans, corn, salsa, garlic, spices and a splash of water in the slow cooker.','Cook 8 h low or 4 h high; shred the chicken into the sauce.','Pack over rice; add cheese and green onion.'],
   store:'Fridge 4 days; freezer friendly.',tip:'Dump-and-go: about 10 minutes of hands-on time.'},
 shawarma:{name:'Chicken shawarma plates',type:'main',P:'chicken_thigh',C:'pita',F:'olive_oil',fixed:[['greek_yogurt',40],['romaine',40],['tomato',60],['cucumber',40],['onion',15]],
   src:src('RecipeTin Eats','https://www.recipetineats.com/chicken-sharwama-middle-eastern/',4.99,591),
   adapt:'Yogurt sauce made with nonfat Greek yogurt; pita is the swappable carb (rice works too).',
   steps:['Marinate thighs in lemon, garlic, the oil and the spice mix (coriander, cumin, cardamom, smoked paprika, cayenne), ideally overnight.','Stir a garlic-lemon yogurt sauce and chill it.','Sear the chicken in a hot pan 4–5 min per side, rest and slice.','Pack with salad and pita; keep the sauce separate.'],
   store:'Chicken 4 days; sauce 3 days.',tip:'The site\'s most-loved recipe: restaurant flavor from pantry spices.'},
 greek:{name:'Greek sheet-pan chicken',type:'main',P:'chicken_thigh',C:'red_potato',F:'feta',fixed:[['zucchini',80],['bell_pepper',60],['tomato',60],['onion',30],['olives',15]],
   src:src('Downshiftology','https://downshiftology.com/recipes/greek-sheet-pan-chicken/',4.96,831),
   adapt:'Skinless thighs and much less oil than the original (35 g fat); potatoes roast on the same pan.',
   steps:['Whisk lemon, garlic, oregano, thyme, Dijon and a spoon of oil; coat the chicken.','Spread potatoes and vegetables on the pan, nestle the chicken in. Roast at 425 °F for 30 min.','Add olives and feta; roast 10–15 min more until the chicken hits 165 °F.'],
   store:'Fridge 4 days, freezer 3 months.',tip:'One pan, everything included.'},
 soup:{name:'Ginger turmeric chicken soup',type:'main',P:'chicken_breast',C:'couscous',F:'olive_oil',fixed:[['carrot',40],['celery',30],['onion',30],['peas',30]],
   src:src('Ambitious Kitchen','https://www.ambitiouskitchen.com/the-best-chicken-soup-recipe/',4.91,1571),
   adapt:'Pearl couscous is the carb; cook it separately if you plan to freeze.',
   steps:['Sweat garlic, onion, carrot and celery in the oil.','Stir in fresh ginger and turmeric, then add broth, chicken, rosemary and thyme.','Bring to a boil, add couscous and simmer 20–25 min.','Shred the chicken back in and add peas.'],
   store:'Fridge 4–5 days; freeze without the couscous.',tip:'Over 1,500 reviews. Good on cold ski evenings.'},
 thai:{name:'Thai red curry chicken',type:'main',P:'chicken_thigh',C:'white_rice',F:'coconut_light',fixed:[['butternut',60],['green_beans',50]],
   src:src('RecipeTin Eats','https://www.recipetineats.com/thai-red-curry-with-chicken/',4.94,358),
   adapt:'Light coconut milk and more chicken than the original, so it fits a deficit.',
   steps:['Fry red curry paste with garlic, ginger and lemongrass for 2 min.','Add broth and reduce by half; add coconut milk, lime leaves, fish sauce and a little sugar.','Simmer the chicken 8–10 min, then the squash and beans for 3 min. Stir in basil.','Pack over jasmine rice.'],
   store:'Fridge 3–4 days.',tip:'Tastes like takeout using store-bought paste.'},
 curry:{name:'Chana masala with chicken',type:'main',P:'chicken_breast',C:'brown_rice',F:'olive_oil',fixed:[['chickpeas',70],['tomato_crushed',100],['onion',30],['spinach',30]],
   src:src('Cookie and Kate','https://cookieandkate.com/quick-vegan-chana-masala/',4.7,211),
   adapt:'We add diced chicken breast so it reaches your protein target (the original is vegan).',
   steps:['Start the rice.','Sauté onion and jalapeño in the oil; add garlic, ginger, garam masala, coriander, cumin, turmeric and cayenne for 1 min.','Add tomatoes, chickpeas and the cooked chicken; simmer at least 10 min. Stir in spinach and lemon.'],
   store:'Fridge 5 days; freezes well.',tip:'Readers say it tastes even better as leftovers.'},
 shrimp:{name:'Shrimp and broccoli stir-fry',type:'main',P:'shrimp',C:'white_rice',F:'sesame_oil',fixed:[['broccoli',170]],
   src:src('Damn Delicious','https://damndelicious.net/2015/01/16/easy-shrimp-broccoli-stir-fry/',4.87,109),
   adapt:'Served over rice (the swappable carb).',
   steps:['Whisk soy, oyster sauce, rice vinegar, a little brown sugar, ginger, garlic and cornstarch.','Sear the shrimp 2–3 min until pink.','Add broccoli 2–3 min until tender-crisp, then the sauce until glossy.','Pack over rice. Eat within 3 days; reheat gently.'],
   store:'Fridge 3 days.',tip:'20 minutes, big vegetable portion.'},
 pork:{name:'Balsamic pork tenderloin and potatoes',type:'main',P:'pork_tender',C:'red_potato',F:'olive_oil',fixed:[['green_beans',100],['parmesan',5]],
   src:src('Le Creme de la Crumb','https://www.lecremedelacrumb.com/sheet-pan-pork-tenderloin-and-potatoes/',4.97,380),
   adapt:'Half the brown sugar in the glaze, green beans added to the pan, portions sized for your targets.',
   steps:['Oven 425 °F. Brush the pork with balsamic, soy, garlic powder, smoked paprika and a little brown sugar.','Toss halved potatoes with the oil, Italian herbs and Parmesan on the other half of the pan.','Roast 40–45 min (add green beans for the last 15), turning the pork a few times. Rest 5 min, slice.'],
   store:'Fridge 3–4 days.',tip:'Sweet-savory glaze and crispy Parmesan potatoes on one pan.'},
 meatballs:{name:'Turkey meatballs marinara',type:'main',P:'turkey93',C:'pasta',F:'olive_oil',fixed:[['parmesan',8],['tomato_crushed',150],['onion',20],['zucchini',60]],
   src:src('Skinnytaste','https://www.skinnytaste.com/skinny-italian-meatballs-turkey-1-p/',4.94,75),
   adapt:'A little Pecorino on top; the sauce oil is the fat lever. Pasta can swap to whole-wheat.',
   steps:['Simmer a quick garlic-tomato sauce with onion, bay leaf, oregano and basil.','Mix turkey with egg, breadcrumbs and herbs; roll ping-pong-size balls.','Bake at 400 °F for 18–20 min, then simmer in the sauce 20 min.','Pack over pasta; grate cheese on top.'],
   store:'Fridge 4 days, freezer 3 months.',tip:'Stays juicy despite lean turkey.'},
 salmon:{name:'Sheet-pan teriyaki salmon',type:'main',P:'salmon',C:'white_rice',F:'sesame_oil',fixed:[['broccoli',100],['bell_pepper',60]],
   src:src('Skinnytaste','https://www.skinnytaste.com/sheet-pan-teriyaki-salmon-and-vegetables/',4.96,91),
   adapt:'Doubled for prep and served over rice.',
   steps:['Marinate salmon 10 min in soy, rice vinegar, a little brown sugar, garlic and ginger.','Roast oiled broccoli and peppers at 400 °F for 10 min.','Add salmon; roast 7–8 min. Reduce the marinade to a glaze and brush on.','Best within 3 days; reheat gently at half power or eat cold.'],
   store:'Fridge 3 days.',tip:'Light and done in 25 minutes.'},
 tikka:{name:'Slow cooker chicken tikka masala',type:'main',P:'chicken_thigh',C:'white_rice',F:'heavy_cream',fixed:[['tomato_sauce',70],['onion',30],['spinach',40]],
   src:src('Budget Bytes','https://www.budgetbytes.com/slow-cooker-chicken-tikka-masala/',4.48,167),
   adapt:'Spinach added for vegetables. Cream is the fat lever, so it stays controlled.',
   steps:['Rub thighs with garam masala, cumin, turmeric, smoked paprika and cayenne; sear both sides.','Soften onion in the same pan; add to the slow cooker with garlic, ginger and tomato sauce.','Cook 6 h low or 3 h high. Stir in the cream and spinach; serve over basmati.'],
   store:'Fridge 4 days; freezes well.',tip:'Hands-off takeout-style curry.'},
 /* ---------- snacks ---------- */
 egg_bites:{name:'Copycat egg bites + fruit',type:'snack',P:'cottage',C:'banana',F:'almonds',fixed:[['eggs',40],['gruyere',10]],
   src:src('The Girl on Bloor','https://thegirlonbloor.com/copycat-oven-baked-starbucks-egg-bites/',4.81,513),
   adapt:'Bacon left optional; paired with fruit and a few almonds.',
   steps:['Blend cottage cheese, Gruyère, a little cornstarch and salt, then pulse in the eggs.','Pour into a greased muffin tin (bacon in the bottom if using).','Bake at 300 °F for 30 min with a pan of water on the rack below (that keeps them silky).'],
   store:'Fridge 5 days, freezer 2 months.',tip:'Tastes like the Starbucks sous-vide bites with no special equipment.'},
 balls:{name:'No-bake protein balls',type:'snack',P:'whey',C:'oats',F:'almonds',fixed:[['honey',12]],
   src:src('Feel Good Foodie','https://feelgoodfoodie.net/recipe/protein-balls/',4.89,71),
   adapt:'Almond flour counted as almonds; oat flour as oats (blend oats yourself).',
   steps:['Stir almond flour, protein powder, oat flour, honey and a little water into a dough.','Fold in cinnamon or a few mini chocolate chips.','Roll into balls with oiled hands; chill 20 min.'],
   store:'Fridge 2 weeks, freezer 3 months.',tip:'Great in a ski jacket pocket.'},
 cottage:{name:'Whipped garlic-herb cottage cheese dip',type:'snack',P:'cottage',C:'pita',F:'olive_oil',fixed:[['carrot',60],['cucumber',60]],
   src:src('Ambitious Kitchen','https://www.ambitiouskitchen.com/garlic-herb-cottage-cheese-dip/',4.75,8),
   adapt:'With pita and veggies to dip; olive oil drizzle is the fat lever.',
   steps:['Blend cottage cheese, basil, thyme, a small garlic clove, lemon and pepper 30–60 s until silky.','Portion into small containers with cut vegetables and pita.'],
   store:'Fridge 3–4 days.',tip:'Reviewers compare it to Boursin.'},
 pb_muffins:{name:'PB protein muffin + yogurt',type:'snack',P:'greek_yogurt',C:'berries',F:'almonds',fixed:[['pb_muffin',60]],
   src:src('The Real Food Dietitians','https://therealfooddietitians.com/protein-muffins/',4.8,20),
   adapt:'One muffin (page nutrition) plus yogurt and berries sized to your snack.',
   steps:['Whisk flour, whey, cinnamon, baking soda and salt; separately whisk peanut butter, Greek yogurt, eggs, maple, oil and vanilla.','Combine, fold in chocolate chips, and fill a muffin tin.','Bake at 350 °F for 14–16 min.'],
   store:'Fridge 1 week, freezer 6 months.',tip:'Grab-and-go before or after time outside.'},
 yogurt:{name:'Greek yogurt crunch bowl',type:'snack',P:'greek_yogurt',C:'berries',F:'almonds',fixed:[],
   steps:['Portion yogurt into jars. Keep almonds and fruit in a separate small bag so they stay crisp.'],
   tip:'A simple staple; no recipe needed.'},
 shake:{name:'Shake, banana and peanut butter',type:'snack',P:'whey',C:'banana',F:'peanut_butter',fixed:[],
   steps:['Shake the protein with water. Pre-portion the powder into bags on prep day.','On ski days, eat the banana + PB on the lift and have the shake after.'],
   tip:'A simple staple for training and ski days.'}
};
const SP={"burritos": ["Paprika", "Salt and pepper", "Cooking spray", "Parchment and freezer bags"], "egg_muffins": ["Paprika", "Dried basil", "Dried oregano", "Cooking spray"], "baked_oats": ["Cinnamon", "Nutmeg", "Baking powder", "Vanilla extract", "Butter or coconut oil"], "oats": ["Vanilla extract", "Cinnamon"], "pancakes": ["Baking powder", "Vanilla extract", "Cinnamon", "Cooking spray"], "hash": ["Garlic powder", "Paprika", "Cumin", "Dried thyme"], "chia": ["Vanilla extract"], "sandwiches": ["Butter", "Sour cream", "Foil or freezer bags"], "egg_bake": ["Garlic powder", "Cooking spray"], "bulgogi": ["Low-sodium soy sauce", "Brown sugar", "Garlic", "Fresh ginger", "Red pepper flakes", "Gochujang", "Scallions", "Sesame seeds"], "chili": ["Chili powder", "Cumin", "Dried oregano", "Cayenne", "Garlic", "Chicken broth"], "burrito": ["Chili powder", "Cumin", "Dried oregano", "Cayenne", "Garlic", "Scallions"], "shawarma": ["Lemons", "Garlic", "Ground coriander", "Cumin", "Ground cardamom", "Smoked paprika", "Cayenne"], "greek": ["Lemons", "Garlic", "Dried oregano", "Dried thyme", "Dijon mustard", "Fresh parsley"], "soup": ["Low-sodium chicken broth", "Garlic", "Fresh ginger", "Turmeric", "Rosemary", "Dried thyme"], "thai": ["Red curry paste", "Garlic", "Fresh ginger", "Lemongrass", "Kaffir lime leaves", "Fish sauce", "Sugar", "Chicken broth", "Thai basil"], "curry": ["Jalapeño", "Garlic", "Fresh ginger", "Garam masala", "Ground coriander", "Cumin", "Turmeric", "Cayenne", "Lemons", "Cilantro"], "shrimp": ["Low-sodium soy sauce", "Oyster sauce", "Rice vinegar", "Brown sugar", "Fresh ginger", "Garlic", "Cornstarch", "Sriracha"], "pork": ["Balsamic vinegar", "Low-sodium soy sauce", "Brown sugar", "Garlic powder", "Smoked paprika", "Italian seasoning", "Red pepper flakes"], "meatballs": ["Garlic", "Bay leaves", "Dried oregano", "Fresh basil", "Fresh parsley", "Seasoned breadcrumbs"], "salmon": ["Low-sodium soy sauce", "Rice vinegar", "Brown sugar", "Garlic", "Fresh ginger"], "tikka": ["Garam masala", "Cumin", "Turmeric", "Smoked paprika", "Cayenne", "Garlic", "Fresh ginger"], "egg_bites": ["Cornstarch", "Cooking spray", "Turkey bacon (optional)"], "balls": ["Cinnamon", "Mini chocolate chips", "Almond flour (optional, instead of blending almonds)"], "cottage": ["Fresh basil", "Fresh thyme", "Garlic", "Lemons"], "pb_muffins": ["Muffin batch: all-purpose flour", "Muffin batch: vanilla whey", "Muffin batch: natural peanut butter", "Muffin batch: Greek yogurt", "Muffin batch: 2 eggs", "Muffin batch: maple syrup", "Muffin batch: avocado oil", "Muffin batch: chocolate chips", "Baking soda", "Cinnamon"]};
for(const k in SP)if(R[k])R[k].sp=SP[k];
F.pb_muffin.made=true;
/* ---------- Method steps: every ingredient in a recipe's table appears here. ----------
   A plain string is always shown. ['C', text] / ['P', text] is the step that prepares the carb / protein:
   if you swap that ingredient, the step is replaced with how to cook the new one ({PREP}).
   ['C', text, alt] uses `alt` (with {PREP}) instead when swapped. Tokens: {P} {C} {F} = current names. */
const SN={white_rice:'rice',brown_rice:'brown rice',potato:'potatoes',red_potato:'potatoes',sweet_potato:'sweet potato',quinoa:'quinoa',pasta:'pasta',ww_pasta:'whole-wheat pasta',couscous:'couscous',barley:'barley',rice_noodles:'rice noodles',oats:'oats',ww_bread:'whole-wheat toast',corn_tortilla:'corn tortillas',black_beans:'black beans',lentils:'lentils',chickpeas:'chickpeas',banana:'banana',berries:'berries',butternut:'butternut squash',cauli_rice:'cauliflower rice',flour_tortilla:'tortillas',eng_muffin:'English muffins',pita:'pita',kidney_beans:'kidney beans',corn:'corn',
 chicken_breast:'chicken breast',chicken_thigh:'chicken thighs',beef93:'lean ground beef',turkey93:'ground turkey',turkey99:'ground turkey',salmon:'salmon',cod:'white fish',shrimp:'shrimp',pork_tender:'pork tenderloin',tofu:'tofu',eggs:'eggs',egg_whites:'egg whites',greek_yogurt:'Greek yogurt',cottage:'cottage cheese',whey:'protein powder',ham:'ham',chicken_sausage:'chicken sausage',
 olive_oil:'olive oil',avocado:'avocado',peanut_butter:'peanut butter',almonds:'almonds',cheddar:'cheddar',feta:'feta',chia:'chia seeds',sesame_oil:'sesame oil',gruyere:'Gruyère',parmesan:'Parmesan',mozzarella:'mozzarella',coconut_light:'light coconut milk',pecans:'pecans',
 broccoli:'broccoli',green_beans:'green beans',bell_pepper:'bell pepper',onion:'onion',spinach:'spinach',zucchini:'zucchini',brussels:'Brussels sprouts',tomato_crushed:'crushed tomatoes',salsa:'salsa',romaine:'lettuce',carrot:'carrots',cucumber:'cucumber',olives:'olives',peas:'peas',celery:'celery',tomato:'tomatoes',tomato_sauce:'tomato sauce',milk:'milk',almond_milk:'almond milk',maple:'maple syrup',honey:'honey',heavy_cream:'cream',pb_muffin:'muffin'};
const PREP={white_rice:'rinse, then simmer 1 part rice to 1.5 parts water, covered, about 18 min. Spread on a tray to cool fast.',
 brown_rice:'simmer 1 part rice to 2 parts water, covered, 40–45 min (or use a rice cooker). Cool fast before packing.',
 potato:'cut into 2 cm cubes, toss with salt and a spray of oil, and roast at 425 °F for 25–30 min.',red_potato:'halve or quarter and roast at 425 °F for 25–30 min, or boil 15 min until tender.',
 sweet_potato:'cut into 2 cm cubes and roast at 425 °F for about 25 min.',quinoa:'rinse, then simmer 1 part quinoa to 2 parts water for 15 min and fluff.',
 pasta:'boil 1 minute short of al dente, drain and toss with a little sauce so it doesn\'t stick.',ww_pasta:'boil 1 minute short of al dente, drain and toss with a little sauce.',
 couscous:'pour boiling water over (1 : 1.25), cover 5 min and fluff (pearl couscous: simmer 8–10 min).',barley:'simmer in plenty of water 30–40 min, then drain.',
 rice_noodles:'soak or boil per the package, then rinse under cold water.',oats:'weigh dry; cook with water or milk 5 min, or soak overnight.',
 ww_bread:'toast it the morning you eat it.',corn_tortilla:'warm in a dry pan when you eat.',flour_tortilla:'warm in a dry pan when you eat.',pita:'warm or toast when you eat.',eng_muffin:'toast when you eat.',
 black_beans:'rinse and drain the can; warm with the dish.',kidney_beans:'rinse and drain the can; warm with the dish.',chickpeas:'rinse and drain the can; warm with the dish.',
 lentils:'simmer 20–25 min until tender, then drain.',banana:'slice fresh when you eat.',berries:'add fresh when you eat.',butternut:'cube and roast at 425 °F for about 25 min.',
 cauli_rice:'sauté 5 min in a dry non-stick pan.',corn:'warm from frozen with the dish.',
 chicken_breast:'season and bake at 425 °F for 18–22 min to 165 °F inside; rest 5 min and slice.',chicken_thigh:'season and roast at 425 °F for 25–30 min to 175 °F inside.',
 beef93:'brown in a skillet 8–10 min, breaking it up; drain any fat.',turkey93:'brown in a skillet 8–10 min to 165 °F, breaking it up.',turkey99:'brown in a skillet 8–10 min to 165 °F, breaking it up.',
 salmon:'season and roast at 425 °F for 10–12 min until it flakes.',cod:'season and bake at 400 °F for 10–12 min until it flakes.',shrimp:'sauté 2–3 min per side until pink.',
 pork_tender:'season and roast at 425 °F for 20–25 min to 145 °F; rest 5 min and slice.',tofu:'press, cube and bake at 425 °F for 25 min.',
 eggs:'scramble, bake or hard-boil (12 min).',egg_whites:'scramble in a non-stick pan 2–3 min.',greek_yogurt:'no cooking: portion into containers.',cottage:'no cooking: portion into containers.',
 whey:'shake with water, or stir into yogurt.',ham:'dice and warm in a skillet 2–3 min.',chicken_sausage:'buy fully cooked; slice into coins and brown 5 min in a skillet (or on the sheet pan).'};
const METHOD={
 burritos:{lockC:false,lockP:false,steps:[
  ['C','Cut the {C} into 1 cm cubes, season with salt and paprika, and roast at 425 °F for 25 min until crisp.'],
  ['P','Soften the diced onion and bell pepper in a pan with cooking spray. Add the diced {P} and brown 2–3 min.','Soften the diced onion and bell pepper in a pan with cooking spray. Separately, cook the {P}: {PREP}'],
  'Soft-scramble the eggs and take them off the heat while still slightly wet, so they don\'t turn rubbery when reheated.',
  'Warm the tortillas. Fill each with its weighed eggs, {C}, {P}, onion and pepper, and the {F}. Fold in the sides and roll tight.',
  'Wrap each burrito in parchment, bag, label and freeze. Reheat from frozen: microwave on defrost 3–5 min, then 1–2 min on high.']},
 egg_muffins:{lockP:true,steps:[
  ['C','Cube the {C}, toss with the {F}, salt and paprika, and roast at 425 °F for 25–30 min.','Cook the {C}: {PREP} Drizzle with the {F} when serving.'],
  'Grease a 12-cup muffin tin or a 9×13 baking dish. Divide the chopped spinach, bell pepper and tomatoes among the cups.',
  'Whisk the whole eggs and {P} with salt, pepper, basil and oregano. Pour into the cups about ¾ full and sprinkle the feta on top.',
  'Bake at 350 °F for 24–28 min (a 9×13 slab takes 25–30 min; cut into squares). Cool completely before packing.',
  'Pack the egg muffins with the {C}. Toast the whole-wheat bread the morning you eat it. Reheat muffins 30 s (1–2 min from frozen).']},
 baked_oats:{lockC:true,steps:[
  'Heat the oven to 375 °F. Toast the chopped {F} on a sheet pan for 5 min.',
  'Mix the {C}, half the {F}, baking powder, cinnamon, nutmeg and a pinch of salt. In another bowl whisk the milk, maple syrup, eggs, melted butter and vanilla.',
  'Scatter the berries in a greased 9-inch dish. Spread the oat mix over them, pour the wet mix over the top, and finish with the rest of the {F}.',
  'Bake 42–50 min until golden and set. Cool, cut into as many squares as servings, and weigh each against the table.',
  ['P','Pack each square with its portion of {P} on the side. Microwave the oatmeal 45–60 s.','Pack each square with its portion of {P} ({PREP}). Microwave the oatmeal 45–60 s.']]},
 oats:{lockC:true,lockP:true,steps:[
  'In each jar stir together the {C}, {P}, Greek yogurt, chia seeds, almond milk, honey, a drop of vanilla and a pinch of salt.',
  'Lid and refrigerate at least 2 hours or overnight.',
  'In the morning stir, loosen with a splash of almond milk if thick, and swirl in the {F}. Add cinnamon or berries if you like.']},
 pancakes:{lockC:true,lockP:true,steps:[
  'Blend the {C}, banana, whole egg, {P}, cottage cheese, baking powder, vanilla and cinnamon until smooth. Let it rest 5 min to thicken.',
  'Cook ¼-cup scoops on a greased non-stick griddle over medium-low heat. Flip when bubbles form and the edges look set.',
  'Cool on a rack, freeze flat on a tray 30 min, then bag.',
  'Reheat 30–60 s in the microwave or in the toaster, and spread the {F} on top.']},
 hash:{steps:[
  ['C','Heat the oven to 400 °F. Dice the {C}, sweet potato, bell pepper and onion. Toss with the {F}, garlic powder, paprika, cumin, thyme and salt, and roast 20 min.','Heat the oven to 400 °F. Dice the sweet potato, bell pepper and onion, toss with the {F}, garlic powder, paprika, cumin, thyme and salt, and roast 20 min. Cook the {C} separately: {PREP}'],
  'Buy fully cooked chicken sausage. Slice it into coins, add it to the pan and roast 15 min more until browned.',
  'Portion the hash (and the {C}) into containers.',
  ['P','Each morning, scramble the whole egg and {P} in a non-stick pan (2–3 min) and serve on the reheated hash.','Each morning, scramble the whole egg in a non-stick pan (2 min). Cook the {P}: {PREP} Serve both on the reheated hash.']]},
 chia:{lockP:true,steps:[
  'In each jar stir the chia seeds into the milk, {P}, maple syrup and a drop of vanilla. Wait 15 min.',
  'Stir again to break up any clumps, lid and refrigerate overnight.',
  ['C','Top with sliced {C} and the {F} the morning you eat it.','Top with the {C} ({PREP}) and the {F} the morning you eat it.']]},
 sandwiches:{lockC:true,steps:[
  'Whisk the eggs with a splash of milk, a spoon of sour cream, salt and pepper. Bake in a buttered 9×13 at 350 °F for 18–20 min; cool and cut into squares.',
  'Toast or broil the {C} halves 2–4 min.',
  ['P','Stack egg, mozzarella and {P} on each {C}; wrap in plastic, then foil or a freezer bag.','Cook the {P}: {PREP} Stack egg, mozzarella and {P} on each {C}; wrap in plastic, then foil or a freezer bag.'],
  'Reheat from frozen: microwave about 3 min, flipping halfway (1 min if thawed). Spread the {F} on when you eat.']},
 egg_bake:{lockP:true,steps:[
  'Heat the oven to 375 °F. Whisk the eggs with garlic powder, salt and pepper.',
  'Fold in the {P}, {F}, chopped spinach and onion. Pour into a greased 9×9 dish and bake 30–35 min until set; cut into squares.',
  ['C','Roast the cubed {C} on a second pan while the eggs bake (425 °F about 25–30 min, or the same 375 °F for 35 min).','Cook the {C}: {PREP}'],
  'Pack egg bake with the {C}. Toast the whole-wheat bread the morning you eat it.']},
 bulgogi:{steps:[
  ['C','Cook the {C}: {PREP}'],
  'Whisk the sauce: low-sodium soy sauce, a spoon of brown sugar, the {F}, red pepper flakes, grated garlic and ginger.',
  ['P','Brown the {P} in a skillet 8–10 min, breaking it up; drain. Add the diced onion, garlic and ginger for 1 min.','Cook the {P}: {PREP} Add the diced onion, garlic and ginger to the pan for 1 min.'],
  'Pour in the sauce, cover and simmer about 10 min. Steam the broccoli 4–5 min.',
  'Pack the {C}, {P} and broccoli. Add sliced cucumber, scallions, sesame seeds and a dab of gochujang when you eat.']},
 chili:{steps:[
  'Soften the diced onion, bell pepper and garlic in the {F} in a large pot.',
  ['P','Add the {P} and brown it, breaking it up. Stir in chili powder, cumin, oregano and cayenne for 1 min.','Cook the {P}: {PREP} Stir in chili powder, cumin, oregano and cayenne for 1 min.'],
  ['C','Add the crushed tomatoes, a cup of chicken broth, the drained {C} and the corn. Simmer 30–45 min (or slow cook 6–7 h on low).','Add the crushed tomatoes, a cup of chicken broth and the corn. Simmer 30–45 min (or slow cook 6–7 h on low). Cook the {C} separately: {PREP}'],
  'Portion and top each serving with its cheddar when you eat.']},
 burrito:{steps:[
  ['P','Put the {P}, black beans, corn, salsa, garlic, chili powder, cumin, oregano, cayenne and a splash of water in the slow cooker.','Put the black beans, corn, salsa, garlic, chili powder, cumin, oregano, cayenne and a splash of water in the slow cooker. Cook the {P}: {PREP} and stir it in at the end.'],
  'Cook 8 h on low or 4 h on high. Shred the chicken into the sauce (if using) and salt to taste.',
  ['C','Cook the {C}: {PREP}'],
  'Pack over the {C}. Add the cheddar, scallions and sliced {F} when you eat.']},
 shawarma:{steps:[
  ['P','Marinate the {P} in lemon juice, garlic, the {F} and the spices (coriander, cumin, cardamom, smoked paprika, cayenne), ideally overnight.','Toss the {P} with lemon juice, garlic, the {F} and the spices (coriander, cumin, cardamom, smoked paprika, cayenne), then cook it: {PREP}'],
  'Stir the Greek yogurt with grated garlic, lemon and salt for the sauce; chill it.',
  ['P','Sear the chicken in a hot pan 4–5 min per side, rest 5 min and slice.','Rest and slice.'],
  'Chop the lettuce, tomatoes, cucumber and onion.',
  ['C','Pack with the salad and warm the {C} when you eat. Keep the sauce in a separate cup.','Pack with the salad and the {C} ({PREP}). Keep the sauce in a separate cup.']]},
 greek:{steps:[
  'Heat the oven to 425 °F. Whisk lemon juice, garlic, oregano, thyme, Dijon and the {F}.',
  ['P','Coat the {P} with half the dressing.','Toss the {P} with half the dressing.'],
  ['C','Spread the halved {C}, zucchini, bell pepper, tomatoes and onion on a sheet pan with the rest of the dressing. Nestle in the {P} and roast 30 min.','Spread the zucchini, bell pepper, tomatoes and onion on a sheet pan with the rest of the dressing and roast 20 min. Cook the {C} separately: {PREP}'],
  ['P','Add the olives and feta and roast 10–15 min more, until the chicken hits 165 °F. Finish with parsley.','Cook the {P}: {PREP} Add the olives and feta to the vegetables for the last 5 min and finish with parsley.']]},
 soup:{steps:[
  'Sweat the garlic, onion, carrots and celery in the {F} for 5 min.',
  'Stir in grated ginger and turmeric for 1 min, then add low-sodium chicken broth, rosemary and thyme.',
  ['P','Add the {P} whole, bring to a boil and simmer 15 min until cooked; lift out and shred.','Cook the {P}: {PREP}'],
  ['C','Add the {C} and simmer 8–10 min (cook it separately if you plan to freeze).','Cook the {C} separately: {PREP}'],
  'Return the {P} to the pot, stir in the peas, and season. Pack soup and {C} together.']},
 thai:{steps:[
  ['C','Cook the {C}: {PREP}'],
  'Fry the red curry paste with garlic, ginger and lemongrass in a spoon of the {F} for 2 min.',
  'Add a cup of chicken broth and reduce by half, then the rest of the {F}, lime leaves, fish sauce and a pinch of sugar.',
  ['P','Simmer the sliced {P} in the sauce 8–10 min.','Cook the {P}: {PREP} then add it to the sauce.'],
  'Add the cubed butternut squash and green beans for 3–5 min until tender. Stir in Thai basil and pack over the {C}.']},
 curry:{steps:[
  ['C','Cook the {C}: {PREP}'],
  ['P','Cube the {P} and brown it in half the {F}, 6–8 min; set aside.','Cook the {P}: {PREP}'],
  'In the rest of the {F}, sauté the onion and a chopped jalapeño; add garlic, ginger, garam masala, coriander, cumin, turmeric and cayenne for 1 min.',
  'Add the crushed tomatoes, chickpeas and the {P}; simmer 10 min. Stir in the spinach and a squeeze of lemon, and top with cilantro.']},
 shrimp:{steps:[
  ['C','Cook the {C}: {PREP}'],
  'Whisk the sauce: low-sodium soy, oyster sauce, rice vinegar, a little brown sugar, ginger, garlic and cornstarch.',
  ['P','Heat the {F} in a large pan and sear the {P} 2–3 min until pink.','Cook the {P}: {PREP} using the {F}.'],
  'Add the broccoli for 2–3 min until tender-crisp, then pour in the sauce and toss until glossy.',
  'Pack over the {C}. Eat within 3 days and reheat gently.']},
 pork:{steps:[
  'Heat the oven to 425 °F. Mix the glaze: balsamic vinegar, low-sodium soy, garlic powder, smoked paprika and a spoon of brown sugar.',
  ['P','Brush the {P} with the glaze and set it on one side of a foil-lined pan.','Cook the {P}: {PREP} Brush it with the glaze for the last 5 min.'],
  ['C','Toss the halved {C} with the {F}, Italian seasoning and Parmesan on the other side. Roast 40–45 min, turning the pork a few times; add the green beans for the last 15 min.','Roast the green beans with the {F} and Parmesan for 15 min. Cook the {C}: {PREP}'],
  'Rest the pork 5 min, slice, and portion with the {C} and green beans.']},
 meatballs:{steps:[
  'Sauté the onion and garlic in the {F}, add the crushed tomatoes, a bay leaf, oregano and basil, and simmer 15 min. Add the diced zucchini for the last 5 min.',
  ['P','Mix the {P} with 1 egg, seasoned breadcrumbs and parsley; roll ping-pong-size balls. Bake at 400 °F for 18–20 min.','Cook the {P}: {PREP}'],
  'Simmer the {P} in the sauce for 20 min.',
  ['C','Cook the {C}: {PREP}'],
  'Pack the {P} and sauce over the {C}; grate the Parmesan on top.']},
 salmon:{steps:[
  ['C','Cook the {C}: {PREP}'],
  'Whisk low-sodium soy, rice vinegar, a little brown sugar, garlic and ginger.',
  'Toss the broccoli and bell pepper with the {F} and roast at 400 °F for 10 min.',
  ['P','Marinate the {P} in half the sauce 10 min, add it to the pan and roast 7–8 min. Simmer the rest of the sauce until thick and brush it on.','Cook the {P}: {PREP} Simmer the sauce until thick and brush it on.'],
  'Pack over the {C}. Best within 3 days; reheat at half power or eat cold.']},
 tikka:{steps:[
  ['P','Rub the {P} with garam masala, cumin, turmeric, smoked paprika and cayenne; sear both sides.','Season the {P} with garam masala, cumin, turmeric, smoked paprika and cayenne, then cook it: {PREP}'],
  'Soften the onion in the same pan, then add it to the slow cooker with garlic, ginger and the tomato sauce (and the {P}, if searing).',
  'Cook 6 h on low or 3 h on high. Stir in the {F} and the spinach until wilted.',
  ['C','Cook the {C}: {PREP} Pack the curry over it.']]},
 egg_bites:{lockP:true,steps:[
  'Heat the oven to 300 °F and put a pan of hot water on the lower rack.',
  'Blend the {P}, Gruyère, a little cornstarch and salt until smooth, then pulse in the eggs.',
  'Pour into a greased muffin tin (turkey bacon in the bottom, if using) and bake 30 min until just set.',
  ['C','Pack two bites with the {C} and the {F}.','Pack two bites with the {C} ({PREP}) and the {F}.']]},
 balls:{lockC:true,lockP:true,steps:[
  'Blend the {C} into a coarse flour and the {F} into almond flour (or buy almond flour).',
  'Stir both with the {P}, honey, cinnamon and a little water into a stiff dough; fold in mini chocolate chips if you like.',
  'Roll into balls with damp hands and chill 20 min. Weigh your portion against the table.']},
 cottage:{lockP:true,steps:[
  'Blend the {P} with basil, thyme, a small garlic clove, lemon juice and pepper 30–60 s until silky.',
  'Portion into small containers and drizzle with the {F}.',
  ['C','Pack with carrot and cucumber sticks and the {C} for dipping (warm the pita if you like).','Pack with carrot and cucumber sticks and the {C} ({PREP}).']]},
 pb_muffins:{steps:[
  'Bake a batch of 12 muffins: whisk flour, vanilla whey, cinnamon, baking soda and salt; separately whisk peanut butter, Greek yogurt, 2 eggs, maple syrup, avocado oil and vanilla. Combine, fold in chocolate chips, fill a muffin tin and bake at 350 °F for 14–16 min.',
  'Freeze what you won\'t eat in a week.',
  ['C','Pack one muffin with the {P}, the {C} and the {F}.','Pack one muffin with the {P}, the {C} ({PREP}) and the {F}.']]},
 yogurt:{lockP:true,steps:[
  'Put a bowl on the scale and weigh in the {P}.',
  ['C','Tare, add the {C} (frozen berries thaw in about 10 min, or microwave 30 s), then tare again and add the {F}.','Tare and add the {C} ({PREP}), then tare again and add the {F}.'],
  'Taking it to work? Pack the {P} in a jar and the {C} and {F} in a small bag so they stay crisp.']},
 shake:{lockP:true,steps:[
  'Weigh the {P} into a shaker, add 300–350 ml cold water and shake 20 s. (Optional: pre-weigh a few scoops into bags so it goes even faster.)',
  ['C','Eat the {C} with the {F}. On ski days, eat these on the lift and have the shake afterwards.','Eat the {C} ({PREP}) with the {F}. On ski days, eat these on the lift and have the shake afterwards.']]}
};
for(const k in METHOD){if(R[k]){R[k].steps=METHOD[k].steps;R[k].lockC=!!METHOD[k].lockC;R[k].lockP=!!METHOD[k].lockP;}}
function sn(id){return SN[id]||F[id].name.toLowerCase()}
/* Render the method for the current swap: tokens resolved; swapped roles use alt text or a generic prep step. */
function methodSteps(rec,Pid,Cid){
  const P=Pid||rec.P, C=Cid||rec.C, sP=P!==rec.P, sC=C!==rec.C;
  const fill=(t,role)=>t.replace(/\{PREP\}/g,(PREP[role==='P'?P:C]||'prepare it as you normally would.').replace(/^./,c=>c.toUpperCase())).replace(/\{P\}/g,sn(P)).replace(/\{C\}/g,sn(C)).replace(/\{F\}/g,sn(rec.F));
  return rec.steps.map(st=>{
    if(typeof st==='string')return fill(st);
    const [role,text,alt]=st, swapped=role==='P'?sP:sC;
    if(!swapped)return fill(text,role);
    return fill(alt||`Cook the {${role}}: {PREP}`,role);
  });
}
function eff(rec,sw){sw=sw||{};return [rec.lockP?rec.P:(sw.P||rec.P),rec.lockC?rec.C:(sw.C||rec.C)]}
function photoUrl(rid){const id=(S.photos||{})[rid];return id?'/_blob/'+id:null}
function initials(n){return n.replace(/\(.*\)/,'').split(/\s+/).filter(w=>/^[A-Za-z]/.test(w)&&!/^(and|with|the|a)$/i.test(w)).slice(0,2).map(w=>w[0].toUpperCase()).join('')}
const TINTS={breakfast:['#f3c98b','#e98a5c'],main:['#8fc7a8','#3f8f7a'],snack:['#b9b3ea','#7c6fcf']};
function dishThumb(rid,cls){const r=R[rid],u=photoUrl(rid),t=TINTS[r.type]||TINTS.main;
  return u?`<img class="${cls}" src="${u}" alt="${esc(r.name)}" loading="lazy">`:`<span class="${cls} ph" style="background:linear-gradient(135deg,${t[0]},${t[1]})" aria-hidden="true">${initials(r.name)}</span>`}
function dishName(rec,Pid,Cid){const P=Pid||rec.P,C=Cid||rec.C;const bits=[];if(P!==rec.P)bits.push(sn(P));if(C!==rec.C)bits.push(sn(C));return rec.name+(bits.length?` (with ${bits.join(' and ')})`:'')}

/* Proteins that make sense for each kind of meal (keeps swaps realistic). */
const P_OPTS={main:['chicken_breast','chicken_thigh','beef93','turkey93','turkey99','salmon','cod','shrimp','pork_tender','tofu','chicken_sausage'],
 breakfast:['egg_whites','ham','chicken_sausage','turkey93','greek_yogurt','cottage','tofu','whey'],
 snack:['greek_yogurt','cottage','whey','egg_whites','ham']};
function pOpts(rec,cur){const ids=P_OPTS[rec.type]||P_OPTS.main;return [...new Set([rec.P,cur,...ids])].filter(id=>F[id]).map(id=>F[id])}
/* ---------- Cooked-together components ----------
   Ingredients cooked in the same pan/pot become one dish you portion by weight after cooking.
   Tokens P/C/F = the recipe's (possibly swapped) protein, carb and fat. Anything not listed is portioned on its own. */
const COMP={
 burritos:[['{P}, onion and pepper sauté',['P','onion','bell_pepper']]],
 egg_muffins:[['Egg muffins',['P','eggs','spinach','bell_pepper','tomato','feta']],['Roasted {C}',['C','F']]],
 baked_oats:[['Blueberry baked oatmeal',['C','F','berries','milk','eggs','maple']]],
 pancakes:[['Protein pancakes',['C','P','cottage','eggs','banana']]],
 hash:[['Roasted hash ({C}, sweet potato, peppers, onion, sausage)',['C','sweet_potato','bell_pepper','onion','F','chicken_sausage']],['Scramble ({P} + whole egg)',['P','eggs']]],
 egg_bake:[['Cottage cheese egg bake',['P','F','eggs','spinach','onion']]],
 bulgogi:[['Bulgogi ({P}, onion, sauce)',['P','onion','F']]],
 chili:[['Chili ({P}, {C}, corn, tomatoes)',['P','C','F','corn','tomato_crushed','bell_pepper','onion']]],
 burrito:[['Taco filling ({P}, beans, corn, salsa)',['P','black_beans','corn','salsa']]],
 shawarma:[['Shawarma ({P})',['P','F']],['Salad (lettuce, tomato, cucumber, onion)',['romaine','tomato','cucumber','onion']]],
 greek:[['Roasted {C} and vegetables',['C','zucchini','bell_pepper','tomato','onion','olives']]],
 soup:[['Soup ({P}, {C}, vegetables)',['P','C','F','carrot','celery','onion','peas']]],
 thai:[['Red curry ({P}, squash, green beans, sauce)',['P','F','butternut','green_beans']]],
 curry:[['Chana masala ({P}, chickpeas, tomatoes)',['P','F','chickpeas','tomato_crushed','onion','spinach']]],
 shrimp:[['Stir-fry ({P} and broccoli)',['P','F','broccoli']]],
 pork:[['Parmesan roasted {C}',['C','F','parmesan']]],
 meatballs:[['Marinara (tomatoes, zucchini, onion, oil)',['F','tomato_crushed','onion','zucchini']]],
 salmon:[['Roasted broccoli and peppers',['broccoli','bell_pepper','F']]],
 tikka:[['Tikka masala ({P}, sauce, spinach)',['P','F','tomato_sauce','onion','spinach']]],
 egg_bites:[['Egg bites',['P','eggs','gruyere']]],
 balls:[['Protein balls',['P','C','F','honey']]]
};
for(const k in R)R[k].id=k;
/* Prep style. fresh: faster to make each time than to prep (no cooking, 2-3 min).
   jar: no cooking; fill jars on prep day (keeps 4-5 days) or one the night before. */
const PREPMODE={yogurt:{mode:'fresh',min:2,into:'bowl',why:'Scoop, top and eat. Prepping it ahead only makes the almonds soggy.'},
 shake:{mode:'fresh',min:2,into:'shaker',why:'Shake the powder with water and grab the banana. Pre-portion the powder into bags if you want it even faster.'},
 oats:{mode:'jar',min:5,why:'The oats need at least 2 hours in the fridge, so fill the jars on prep day or one each the night before.'},
 chia:{mode:'jar',min:5,why:'The chia needs about 2 hours to set, so fill the jars on prep day or the night before; add the fruit the morning you eat it.'}};
for(const k in PREPMODE)R[k].pm=PREPMODE[k];
/* Items that are added when you eat, not cooked in the batch. */
const ADD_FRESH=new Set(['banana','avocado','berries']);
function tokId(t,rec,P,C){return t==='P'?P:t==='C'?C:t==='F'?rec.F:t}
function perGram(ratio){const m={p:0,c:0,f:0,k:0,fib:0};for(const id in ratio){const x=F[id],r=ratio[id]/100;m.p+=x.p*r;m.c+=x.c*r;m.f+=x.f*r;m.k+=x.k*r;m.fib+=x.fib*r}return m}
/* Non-negative least squares over all subsets of columns (few variables), errors weighted by kcal (4/4/9). */
function nnls(cols,res){const n=cols.length;let best=null;
  for(let mask=1;mask<(1<<n);mask++){const idx=[...Array(n).keys()].filter(i=>mask&(1<<i));
    const A=idx.map(i=>idx.map(j=>cols[i].reduce((s,_,k)=>s+cols[i][k]*cols[j][k],0)));
    const b=idx.map(i=>cols[i].reduce((s,v,k)=>s+v*res[k],0));
    const sol=solveLin(A,b);if(!sol||sol.some(v=>v<0))continue;
    const x=Array(n).fill(0);idx.forEach((i,j)=>x[i]=sol[j]);
    const err=[0,1,2].reduce((s,k)=>{const e=cols.reduce((a,c,i)=>a+c[k]*x[i],0)-res[k];return s+e*e},0);
    if(!best||err<best.err-1e-9)best={x,err};}
  return best?best.x:Array(n).fill(0);}
/* The meal as it's really cooked: one batch shared by everyone, portioned per person.
   Returns each person's portions (mixtures + separate items) and the cooked batch per serving-day. */
const _mpCache=new Map();
function mealPlan(rec,share,Pid,Cid){
  const P=Pid||rec.P, C=Cid||rec.C, ppl=S.people;
  const ck=JSON.stringify([rec.id,share,P,C,ppl]);if(_mpCache.has(ck))return _mpCache.get(ck);
  const ind=ppl.map(pp=>{const tg=slotTarget(targets(pp),share);return {tg,sol:portion(rec,tg,P,C)}});
  const gi=(sol,id)=>sol.items.reduce((a,[i,g])=>a+(i===id?g:0),0);
  const mixes=(COMP[rec.id]||[]).map(([name,toks])=>{const ids=[...new Set(toks.map(t=>tokId(t,rec,P,C)))];let sum=0;const tot={};
    for(const id of ids){tot[id]=ind.reduce((a,x)=>a+gi(x.sol,id),0);sum+=tot[id]}
    const ratio={};for(const id of ids)ratio[id]=sum?tot[id]/sum:0;
    name=name.replace(/\{P\}/g,sn(P)).replace(/\{C\}/g,sn(C)).replace(/\{F\}/g,sn(rec.F)).replace(/^./,c=>c.toUpperCase());
    return {name,ids,ratio,lever:toks.some(t=>t==='P'||t==='C'||t==='F'),m:perGram(ratio)}}).filter(x=>x.ids.some(id=>x.ratio[id]>0));
  const inMix=new Set(mixes.flatMap(x=>x.ids));
  const levers=[...new Set([P,C,rec.F])].filter(id=>!inMix.has(id));
  const fixedSep=rec.fixed.filter(([id])=>!inMix.has(id));
  const w=[4,4,9];
  const people=ind.map(({tg,sol})=>{
    const fx={p:0,c:0,f:0};const mixG={},sep={};
    for(const [id,g] of fixedSep){sep[id]=g;fx.p+=F[id].p*g/100;fx.c+=F[id].c*g/100;fx.f+=F[id].f*g/100}
    const varMix=mixes.filter(x=>x.lever);
    for(const x of mixes.filter(x=>!x.lever)){const g=x.ids.reduce((a,id)=>a+gi(sol,id),0);mixG[x.name]=g;fx.p+=x.m.p*g;fx.c+=x.m.c*g;fx.f+=x.m.f*g}
    const cols=[...varMix.map(x=>[x.m.p*w[0],x.m.c*w[1],x.m.f*w[2]]),...levers.map(id=>[F[id].p/100*w[0],F[id].c/100*w[1],F[id].f/100*w[2]])];
    const res=[tg.p-fx.p,tg.c-fx.c,tg.f-fx.f].map((v,i)=>v*w[i]);
    const xs=cols.length?nnls(cols,res):[];
    varMix.forEach((x,i)=>mixG[x.name]=r5(xs[i]));
    levers.forEach((id,i)=>sep[id]=roundG(id,xs[varMix.length+i]));
    const items={};
    for(const x of mixes)for(const id of x.ids)items[id]=(items[id]||0)+mixG[x.name]*x.ratio[id];
    for(const id in sep)items[id]=(items[id]||0)+sep[id];
    const tot=macrosOf(Object.entries(items));
    return {tg,mixG,sep,items,tot};
  });
  const batch={};for(const pp of people)for(const id in pp.items)batch[id]=(batch[id]||0)+pp.items[id];
  const sepIds=[...levers,...fixedSep.map(x=>x[0])].filter((id,i,a)=>a.indexOf(id)===i);
  const out={people,mixes,sepIds,batch,P,C};_mpCache.set(ck,out);if(_mpCache.size>600)_mpCache.clear();return out;
}
function mpFor(pi,rec,share,Pid,Cid){return mealPlan(rec,share,Pid,Cid).people[pi]}

const DEFAULT_REC={breakfast:'burritos',lunch:'bulgogi',dinner:'greek',snack:'egg_bites'};
const WEEK_DEFAULTS=[
 {b1:{breakfast:'burritos',lunch:'bulgogi',dinner:'greek',snack:'egg_bites'},b2:{breakfast:'baked_oats',lunch:'burrito',dinner:'chili',snack:'yogurt'}},
 {b1:{breakfast:'egg_muffins',lunch:'shawarma',dinner:'soup',snack:'balls'},b2:{breakfast:'oats',lunch:'curry',dinner:'meatballs',snack:'shake'}},
 {b1:{breakfast:'sandwiches',lunch:'thai',dinner:'pork',snack:'cottage'},b2:{breakfast:'pancakes',lunch:'shrimp',dinner:'tikka',snack:'pb_muffins'}},
 {b1:{breakfast:'hash',lunch:'bulgogi',dinner:'salmon',snack:'egg_bites'},b2:{breakfast:'chia',lunch:'burrito',dinner:'chili',snack:'yogurt'}}];
const OLD_DEFAULT_PLAN='{"b1":{"breakfast":"oats","lunch":"burrito","dinner":"salmon","snack":"yogurt"},"b2":{"breakfast":"hash","lunch":"bulgogi","dinner":"meatballs","snack":"shake"}}';
function sortPlan(p){const o={};for(const b of ['b1','b2']){o[b]={};for(const k of ['breakfast','lunch','dinner','snack'])o[b][k]=p[b]&&p[b][k];}return o}
/* One-time move from the single-week plan to a 4-week month. */
function normalize(){
  if(!Array.isArray(S.weeks)||S.weeks.length!==4){
    const weeks=clone(WEEK_DEFAULTS);
    if(S.plan&&JSON.stringify(sortPlan(S.plan))!==OLD_DEFAULT_PLAN)weeks[0]=clone(S.plan);
    S.weeks=weeks;S.wswaps=S.wswaps||{};
    for(const k in (S.swaps||{}))S.wswaps['0.'+k]=S.swaps[k];
  }
  S.wswaps=S.wswaps||{};S.staples=S.staples||{};S.photos=S.photos||{};
  if(!S.tplace||typeof S.tplace!=='object')S.tplace={def:'gym',d:{}};S.tplace.d=S.tplace.d||{};
}
function recOf(w,bid,sid){const id=((S.weeks[w]||{})[bid]||{})[sid];return R[id]||R[DEFAULT_REC[sid]]}
function recIdOf(w,bid,sid){const id=((S.weeks[w]||{})[bid]||{})[sid];return R[id]?id:DEFAULT_REC[sid]}
function swOf(w,bid,sid){return S.wswaps[w+'.'+bid+'.'+sid]||{}}
function dayMs(d){return Math.floor(new Date(d+'T12:00:00').getTime()/864e5)}
function nowDay(){const d=new Date();return Math.floor(new Date(d.getFullYear(),d.getMonth(),d.getDate(),12).getTime()/864e5)}
function curWeek(){const diff=nowDay()-dayMs(S.monthStart);return diff<0?0:Math.floor(diff/7)%4}
function weekRange(w){const diff=nowDay()-dayMs(S.monthStart);const cyc=diff<0?0:Math.floor(diff/28);const st=new Date((dayMs(S.monthStart)+cyc*28+w*7)*864e5+12*36e5);const en=new Date(st.getTime()+6*864e5);const f=x=>x.toLocaleDateString(undefined,{month:'short',day:'numeric'});return f(st)+' – '+f(en)}
const SLOTS4=[['breakfast','Breakfast',0.25],['lunch','Lunch',0.30],['dinner','Dinner',0.30],['snack','Snack',0.15]];
const SLOTS3=[['breakfast','Breakfast',0.30],['lunch','Lunch',0.35],['dinner','Dinner',0.35]];
function slots(){return S.meals===3?SLOTS3:SLOTS4}
const BLOCKS_BASE=[{id:'b1',name:'Sunday prep',days:3,covers:'Mon · Tue · Wed'},{id:'b2',name:'Wednesday prep',days:3,covers:'Thu · Fri · Sat'}];
let BLOCKS=BLOCKS_BASE;
function syncBlocks(){BLOCKS=S.sunday?[BLOCKS_BASE[0],{id:'b2',name:'Wednesday prep',days:4,covers:'Thu · Fri · Sat · Sun (freeze Sunday\'s)'}]:BLOCKS_BASE}

