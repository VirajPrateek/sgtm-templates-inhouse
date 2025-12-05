const log = require('logToConsole');
const JSON = require('JSON');

// Lookup table for sport IDs
const sportIDs = { 
  4:'football', 5:'tennis', 6:'formula1', 7:'basketball', 9:'alpine skiing', 10:'cycling', 
  11:'american football', 12:'ice hockey', 13:'golf', 14:'nordic ski', 15:'motorsports', 
  16:'handball', 17:'athletics', 18:'volleyball', 21:'rugby', 22:'cricket', 23:'baseball', 
  24:'boxing', 25:'specials', 26:'the olympics - specials', 27:'bandy', 28:'floorball', 
  29:'horse racing', 30:'trotting', 31:'rugby league', 32:'rugby union', 33:'snooker', 
  34:'darts', 35:'bowls', 36:'aussie rules', 37:'greyhounds', 38:'pool', 39:'nascar', 
  40:'motorbikes', 41:'motorsport', 42:'speedway', 43:'rally', 44:'badminton', 
  45:'combat sports', 46:'equestrian', 47:'fistball', 48:'gaelic sports', 49:'hockey', 
  50:'squash', 51:'swimming', 52:'water polo', 53:'softball', 54:'sailing', 55:'rowing', 
  56:'table tennis', 57:'weightlifting', 58:'archery', 59:'gymnastics', 60:'entertainment', 
  61:'politics', 62:'financials', 63:'beach volleyball', 64:'biathlon', 65:'bobsleigh', 
  66:'canoeing', 67:'chess', 68:'curling', 69:'figure skating', 70:'futsal', 71:'indoor football', 
  72:'luge', 73:'netball', 74:'pelota', 75:'petanque', 76:'poker betting', 77:'rink hockey', 
  78:'fencing', 79:'shooting', 80:'show jumping', 81:'skeleton', 82:'snowboarding', 
  83:'speed skating', 84:'triathlon', 85:'ten pin bowling', 86:'freestyle skiing', 
  87:'padel tennis', 88:'lacrosse', 89:'schwingen', 90:'table football', 91:'motocross', 92:'diving', 
  93:'beach football', 94:'cross country skiing', 95:'ski jumping', 96:'nordic combined', 97:'beach handball', 
  98:'modern pentathlon', 99:'wrestling', 100:'esports', 101:'virtual football', 102:'virtual tennis', 
  103:'virtual basketball', 104:'virtual american football', 105:'cs2', 106:'league of legends', 107:'dota 2', 
  108:'esoccer', 109:'surfing', 110:'x1 football', 111:'pickleball', 112:'footvolley', 113:'breaking', 
  114:'judo', 115:'modern pentathlon', 116:'skateboarding', 117:'sport climbing', 118:'taekwondo',
  501:'rodeo', 1001:'virtual sports', 1002:'football simulated reality', 1010:'apex', 1011:'artifact', 
  1014:'call of duty', 1016:'counter strike: go', 1017:'dota 2', 1018:'csgo faceit', 1019:'fifa', 
  1020:'fortnite', 1021:'fortnite mobile', 1022:'fortnite normals', 1024:'freefire', 1025:'ggst', 
  1026:'gears of war', 1027:'halo 5', 1028:'injustice 2', 1029:'king of glory', 1030:'league of legends', 
  1031:'mk11', 1032:'age of empires ii', 1033:'mvc2', 1034:'nba jam', 1035:'nba 2k', 1036:'novelty', 
  1037:'overwatch', 1038:'pubg', 1039:'rainbow six siege', 1040:'rocket league', 1041:'starcraft 2', 
  1042:'starcraft brood wars', 1043:'sfv', 1044:'aov', 1045:'splitgate', 1046:'tft', 1047:'ufc 3', 
  1048:'ufc 4', 1049:'valorant', 1050:'rainbow 6', 1051:'wild rift', 1052:'cod: warzone', 1053:'nfl', 
  1054:'ufc', 1055:'tekken', 1060:'fishing', 1061:'karate', 1062:'mythical matches', 1063:'short track speed skating', 
  1064:'sport climbing'
};

// Get template parameters
const eventType = data.eventType;

// Final GA4 Items array to be returned
let finalItems = [];
let jsonData = null;
let productsArray = [];

// Map based on event type - exact same logic as client side
switch(eventType) {
  case 'Cart.betAdded':
    jsonData = {};
    jsonData.item_name = data.transactionProducts['product.pickDetails'].split(';')[0];
    jsonData.item_id = data.item_id;
    jsonData.item_brand = data.transactionProducts['name'];
    jsonData.item_category = data.item_category;
    jsonData.item_variant = data.transactionProducts['product.pickDetails'].split(';')[1] + ';' + data.transactionProducts['product.pickDetails'].split(';')[2];
    jsonData.item_selected = data.transactionProducts['product.pickDetails'].split(';')[2];
    jsonData.item_category3 = data.transactionProducts['component.pageLayout'];
    jsonData.item_category4 = data.transactionProducts['gameDetails'];
    jsonData.item_category5 = data.transactionProducts['bet_details'];
    jsonData.price = data.transactionProducts['price'];
    jsonData.item_list_id = 'sports_betting';
    jsonData.item_list_name = 'Sports Betting';
    jsonData.affiliation = data.transactionProducts.transactionAffiliation;
    jsonData.bet_event_id = data.transactionProducts.sku.split('-')[2];
    jsonData.prod_module_name = data.transactionProducts['component.moduleName'] ? data.transactionProducts['component.moduleName'].toLowerCase() : undefined;
    jsonData.prod_module_position = data.transactionProducts['component.modulePosition'] ? data.transactionProducts['component.modulePosition'].toLowerCase() : undefined;
    jsonData.prod_content_position = data.transactionProducts['component.ContentPosition'] ? data.transactionProducts['component.ContentPosition'].toLowerCase() : undefined;
    jsonData.prod_market_id = data.transactionProducts.marketID;
    jsonData.prod_results_id = data.transactionProducts.resultID;
    jsonData.prod_module_cust_name = data.transactionProducts['component.moduleCustName'] ? data.transactionProducts['component.moduleCustName'].toLowerCase() : undefined;
    jsonData.prod_module_competition_config = data.transactionProducts['component.moduleCompetitionConfig'] ? data.transactionProducts['component.moduleCompetitionConfig'].toLowerCase() : undefined;
    jsonData.prod_module_affiliation_config = data.transactionProducts['component.moduleAffiliationConfig'] ? data.transactionProducts['component.moduleAffiliationConfig'].toLowerCase() : undefined;
    jsonData.prod_module_sports_config = data.transactionProducts['component.moduleSportsConfig'] ? data.transactionProducts['component.moduleSportsConfig'].toLowerCase() : undefined;
    jsonData.prod_module_source = data.transactionProducts['component.moduleSource'] ? data.transactionProducts['component.moduleSource'].toLowerCase() : undefined;
    jsonData.prod_module_user_segment = data.transactionProducts['component.userSegment'] ? data.transactionProducts['component.userSegment'].toLowerCase() : undefined;
    jsonData.prod_league_id = data.transactionProducts['leagueID'] ? data.transactionProducts['leagueID'].toLowerCase() : undefined;
    jsonData.prod_marquee_name = data.transactionProducts['marqueeName'] ? data.transactionProducts['marqueeName'].toLowerCase() : undefined;
    jsonData.prod_marquee_type = data.transactionProducts['marqueeType'] ? data.transactionProducts['marqueeType'].toLowerCase() : undefined;
    jsonData.prod_marquee_content_logic = data.transactionProducts['marquee.contentLogic'] ? data.transactionProducts['marquee.contentLogic'].toLowerCase() : undefined;
    jsonData.bet_selections_in_slip = data.transactionProducts['selectionsInSlip'];
    jsonData.quantity = 1;
    jsonData.bet_type = data.transactionProducts['bet_type'] ? data.transactionProducts['bet_type'].toLowerCase() : undefined;
    jsonData.location_id = data.transactionProducts['location_id'] ? data.transactionProducts['location_id'].toLowerCase() : undefined;
    finalItems.push(jsonData);
    break;

  case 'select_item':
    jsonData = {};
    jsonData.item_name = data.transactionProducts['component.moduleCustName'] ? data.transactionProducts['component.moduleCustName'].toLowerCase() : undefined;
    jsonData.item_category = data.transactionProducts['component.modulePosition'] ? data.transactionProducts['component.modulePosition'].split("|")[0] : undefined;
    jsonData.item_variant = sportIDs[data.transactionProducts['sportID']];
    jsonData.index = data.transactionProducts['component.modulePosition'] ? data.transactionProducts['component.modulePosition'].split("|")[1] : undefined;
    jsonData.price = 'not applicable';
    jsonData.item_list_id = 'sports_module';
    jsonData.item_list_name = 'Sports Module';
    jsonData.prod_module_name = data.transactionProducts['component.moduleName'] ? data.transactionProducts['component.moduleName'].toLowerCase() : undefined;
    jsonData.prod_module_position = data.transactionProducts['component.modulePosition'] ? data.transactionProducts['component.modulePosition'].toLowerCase() : undefined;
    jsonData.item_category3 = data.transactionProducts['component.pageLayout'] ? data.transactionProducts['component.pageLayout'].toLowerCase() : undefined;
    jsonData.prod_module_cust_name = data.transactionProducts['component.moduleCustName'] ? data.transactionProducts['component.moduleCustName'].toLowerCase() : undefined;
    jsonData.prod_module_source = data.transactionProducts['component.moduleSource'] ? data.transactionProducts['component.moduleSource'].toLowerCase() : undefined;
    jsonData.quantity = 1;
    finalItems.push(jsonData);
    break;

  case 'select_item-Mar':
    jsonData = {};
    jsonData.item_name = data.transactionProducts['marqueeName'] ? data.transactionProducts['marqueeName'].toLowerCase() : undefined;
    jsonData.item_id = data.transactionProducts.sku;
    jsonData.item_category = sportIDs[data.transactionProducts['sportID']];
    jsonData.item_brand = data.transactionProducts['marqueeType'] ? data.transactionProducts['marqueeType'].toLowerCase() : undefined;
    jsonData.item_list_id = 'marquees';
    jsonData.item_list_name = 'Marquees';
    jsonData.item_variant = data.transactionProducts['page.sitecoretemplateid'] ? data.transactionProducts['page.sitecoretemplateid'].toLowerCase() : undefined;
    jsonData.prod_marquee_name = data.transactionProducts['marqueeName'] ? data.transactionProducts['marqueeName'].toLowerCase() : undefined;
    jsonData.prod_marquee_type = data.transactionProducts['marqueeType'] ? data.transactionProducts['marqueeType'].toLowerCase() : undefined;
    jsonData.prod_module_name = data.transactionProducts['component.moduleName'] ? data.transactionProducts['component.moduleName'].toLowerCase() : undefined;
    jsonData.prod_module_position = data.transactionProducts['component.modulePosition'] ? data.transactionProducts['component.modulePosition'].toLowerCase() : undefined;
    jsonData.item_category3 = data.transactionProducts['component.pageLayout'] ? data.transactionProducts['component.pageLayout'].toLowerCase() : undefined;
    jsonData.prod_module_cust_name = data.transactionProducts['component.moduleCustName'] ? data.transactionProducts['component.moduleCustName'].toLowerCase() : undefined;
    jsonData.prod_module_source = data.transactionProducts['component.moduleSource'] ? data.transactionProducts['component.moduleSource'].toLowerCase() : undefined;
    jsonData.prod_recommendation_type = data.transactionProducts['component.recommendationtype'] ? data.transactionProducts['component.recommendationtype'].toLowerCase() : undefined;
    jsonData.quantity = 1;
    finalItems.push(jsonData);
    break;

  case 'showmarquee':
    jsonData = [];
    productsArray = data.productArray;
    if (productsArray && productsArray.length > 0) {
      for (let i = 0; i < productsArray.length; i++) {
        jsonData.push({
          'item_name': productsArray[i]['marqueeName'] ? productsArray[i]['marqueeName'].toLowerCase() : undefined,
          'item_category': sportIDs[productsArray[i]['sportID']],
          'item_brand': productsArray[i]['marqueeType'] ? productsArray[i]['marqueeType'].toLowerCase() : undefined,
          'item_variant': productsArray[i]['page.sitecoretemplateid'] ? productsArray[i]['page.sitecoretemplateid'].toLowerCase() : undefined,
          'index': productsArray[i]['component.ContentPosition'],
          'item_list_id': 'marquees',
          'item_list_name': 'Marquees',
          'prod_marquee_name': productsArray[i]['marqueeName'] ? productsArray[i]['marqueeName'].toLowerCase() : undefined,
          'prod_marquee_type': productsArray[i]['marqueeType'] ? productsArray[i]['marqueeType'].toLowerCase() : undefined,
          'prod_module_name': productsArray[i]['component.moduleName'] ? productsArray[i]['component.moduleName'].toLowerCase() : undefined,
          'prod_module_position': productsArray[i]['component.modulePosition'] ? productsArray[i]['component.modulePosition'].toLowerCase() : undefined,
          'item_category3': productsArray[i]['component.pageLayout'] ? productsArray[i]['component.pageLayout'].toLowerCase() : undefined,
          'prod_module_cust_name': productsArray[i]['component.moduleCustName'] ? productsArray[i]['component.moduleCustName'].toLowerCase() : undefined,
          'prod_module_source': productsArray[i]['component.moduleSource'] ? productsArray[i]['component.moduleSource'].toLowerCase() : undefined,
          'prod_recommendation_type': productsArray[i]['component.recommendationtype'] ? productsArray[i]['component.recommendationtype'].toLowerCase() : undefined,
          'prod_marquee_content_logic': productsArray[i]['marquee.contentLogic'] ? productsArray[i]['marquee.contentLogic'].toLowerCase() : undefined,
          'prod_league_id': productsArray[i]['leagueID'] ? productsArray[i]['leagueID'].toLowerCase() : undefined
        });
      }
    }
    finalItems = jsonData;
    break;

  case 'showmodule':
    jsonData = [];
    productsArray = data.productArray;
    if (productsArray && productsArray.length > 0) {
      for (let i = 0; i < productsArray.length; i++) {
        const positionArray = productsArray[i]['component.modulePosition'] ? productsArray[i]['component.modulePosition'].split("|") : [];
        let itemObj = {};
        
        itemObj.item_name = productsArray[i]['component.moduleCustName'] ? productsArray[i]['component.moduleCustName'].toLowerCase() : undefined;
        itemObj.item_category = positionArray[0] ? positionArray[0].toLowerCase() : undefined;
        itemObj.index = positionArray[1];
        itemObj.item_list_id = 'sports_module';
        itemObj.item_list_name = 'Sports Module';
        itemObj.prod_module_name = productsArray[i]['component.moduleName'] ? productsArray[i]['component.moduleName'].toLowerCase() : undefined;
        itemObj.prod_module_position = productsArray[i]['component.modulePosition'] ? productsArray[i]['component.modulePosition'].toLowerCase() : undefined;
        itemObj.item_category3 = productsArray[i]['component.pageLayout'] ? productsArray[i]['component.pageLayout'].toLowerCase() : undefined;
        itemObj.prod_module_cust_name = productsArray[i]['component.moduleCustName'] ? productsArray[i]['component.moduleCustName'].toLowerCase() : undefined;
        itemObj.prod_module_source = productsArray[i]['component.moduleSource'] ? productsArray[i]['component.moduleSource'].toLowerCase() : undefined;
        itemObj.prod_module_user_segment = productsArray[i]['component.userSegment'] ? productsArray[i]['component.userSegment'].toLowerCase() : undefined;
        
        if (productsArray[i]['component.recommendationtype'] !== undefined) {
          itemObj.prod_recommendation_type = productsArray[i]['component.recommendationtype'] ? productsArray[i]['component.recommendationtype'].toLowerCase() : undefined;
        } else if (productsArray[i]['component.sitecoreID'] !== undefined) {
          itemObj.prod_sitecore_id = productsArray[i]['component.sitecoreID'];
        }
        
        jsonData.push(itemObj);
      }
    }
    finalItems = jsonData;
    break;

  case 'shownextraces':
    jsonData = [];
    productsArray = data.productArray;
    if (productsArray && productsArray.length > 0) {
      for (let i = 0; i < productsArray.length; i++) {
        jsonData.push({
          'item_name': productsArray[i]['component.moduleCustName'] ? productsArray[i]['component.moduleCustName'].toLowerCase() : undefined,
          'item_category': productsArray[i]['component.moduleName'] ? productsArray[i]['component.moduleName'].toLowerCase() : undefined,
          'item_brand': productsArray[i]['component.modulePosition'],
          'index': productsArray[i]['component.ContentPosition'],
          'item_list_id': 'next_races',
          'item_list_name': 'Next Races',
          'prod_module_name': productsArray[i]['component.moduleName'] ? productsArray[i]['component.moduleName'].toLowerCase() : undefined,
          'prod_module_position': productsArray[i]['component.modulePosition'] ? productsArray[i]['component.modulePosition'].toLowerCase() : undefined,
          'item_category3': productsArray[i]['component.pageLayout'] ? productsArray[i]['component.pageLayout'].toLowerCase() : undefined,
          'prod_module_cust_name': productsArray[i]['component.moduleCustName'] ? productsArray[i]['component.moduleCustName'].toLowerCase() : undefined,
          'prod_module_source': productsArray[i]['component.moduleSource'] ? productsArray[i]['component.moduleSource'].toLowerCase() : undefined
        });
      }
    }
    finalItems = jsonData;
    break;

  case 'Cart.purchase':
    jsonData = [];
    productsArray = data.transactionProducts;
    if (productsArray && productsArray.length > 0) {
      for (let i = 0; i < productsArray.length; i++) {
        if (productsArray[i] !== undefined) {
          jsonData.push({
            'item_name': productsArray[i]['product.pickDetails'] ? productsArray[i]['product.pickDetails'].split(';')[0] : undefined,
            'item_id': productsArray[i].sku,
            'item_brand': productsArray[i].name,
            'item_variant': productsArray[i]['product.pickDetails'] ? productsArray[i]['product.pickDetails'].split(';')[1] + ';' + productsArray[i]['product.pickDetails'].split(';')[2] : undefined,
            'item_category': sportIDs[productsArray[i].sku.split('-')[0] * 1],
            'item_category2': productsArray[i].category,
            'item_category3': productsArray[i]['component.pageLayout'],
            'item_category4': productsArray[i].gameDetails,
            'item_category5': productsArray[i].bet_details,
            'price': productsArray[i].price ? (productsArray[i].price * 0.01) : undefined,
            'affiliation': productsArray[i].transactionAffiliate,
            'item_list_id': 'sports_betting',
            'item_list_name': 'Sports Betting',
            'bet_odds': productsArray[i].odds,
            'bet_promo': productsArray[i].insurance,
            'bet_event_id': productsArray[i].sku ? productsArray[i].sku.split('-')[2] : undefined,
            'prod_module_name': productsArray[i]['component.moduleName'] ? productsArray[i]['component.moduleName'].toLowerCase() : undefined,
            'prod_module_position': productsArray[i]['component.modulePosition'] ? productsArray[i]['component.modulePosition'].toLowerCase() : undefined,
            'prod_content_position': productsArray[i]['component.ContentPosition'],
            'prod_market_id': productsArray[i].marketID,
            'prod_results_id': productsArray[i].resultID,
            'prod_module_cust_name': productsArray[i]['component.moduleCustName'],
            'prod_module_competition_config': productsArray[i]['component.moduleCompetitionConfig'],
            'prod_module_affiliation_config': productsArray[i]['component.moduleAffiliationConfig'],
            'prod_module_sports_config': productsArray[i]['component.moduleSportsConfig'],
            'prod_module_source': productsArray[i]['component.moduleSource'],
            'bet_type_system': productsArray[i].systemBetType,
            'bet_request_id': productsArray[i].betRequestID,
            'prod_betslip_id': productsArray[i].betslipID,
            'prod_league_id': productsArray[i].leagueID,
            'prod_module_user_segment': productsArray[i]['component.userSegment'],
            'prod_marquee_name': productsArray[i].marqueeName ? productsArray[i].marqueeName.toLowerCase() : undefined,
            'prod_marquee_type': productsArray[i].marqueeType ? productsArray[i].marqueeType.toLowerCase() : undefined,
            'prod_marquee_content_logic': productsArray[i]['marquee.contentLogic'],
            'prod_recommendation_type': productsArray[i]['component.recommendationtype'] ? productsArray[i]['component.recommendationtype'].toLowerCase() : undefined,
            'bet_tracking_type': productsArray[i].bet_tracking_type,
            'bet_type': productsArray[i].bet_type,
            'location_id': productsArray[i].location_id,
            'quantity': 1
          });
        }
      }
    }
    finalItems = jsonData;
    break;

  case 'gameMultiplier':
    jsonData = [];
    productsArray = data.productArray;
    if (productsArray && productsArray.length > 0) {
      for (let i = 0; i < productsArray.length; i++) {
        jsonData.push({
          'item_list_id': 'game_multiplier',
          'item_list_name': 'game multiplier',
          'game_id': productsArray[i]['component.gameName'],
          'game_name': productsArray[i]['component.gameDisplayName'],
          'game_type': productsArray[i]['component.gameType'],
          'game_category': productsArray[i]['component.Game.section'],
          'category_type': productsArray[i]['component.categoryType'],
          'category_subtype': productsArray[i]['component.categorySubType'],
          'game_grid': productsArray[i]['component.Game.GridPosition'],
          'game_containerloc': productsArray[i]['component.gameContainerLocation'],
          'game_fav': productsArray[i]['component.gameFavourite'],
          'game_position': productsArray[i]['component.Game.Position'],
          'game_recommendation_type': productsArray[i]['component.recommendationtype']
        });
      }
    }
    finalItems = jsonData;
    break;

  case 'begin_checkout':
  jsonData = [];
  productsArray = data.transactionProducts;
  if (productsArray && productsArray.length > 0) {
    for (let i = 0; i < productsArray.length; i++) {
      if (productsArray[i] !== undefined) {
        jsonData.push({
          'item_name': productsArray[i]['product.pickDetails'] ? productsArray[i]['product.pickDetails'].split(';')[0] : undefined,
          'item_id': productsArray[i].sku,
          'item_brand': productsArray[i].name,
          'item_variant': productsArray[i]['product.pickDetails'] ? productsArray[i]['product.pickDetails'].split(';')[1] + ';' + productsArray[i]['product.pickDetails'].split(';')[2] : undefined,
          'item_category': sportIDs[productsArray[i].sku.split('-')[0] * 1],
          'item_category2': productsArray[i].category,
          'item_category3': productsArray[i]['component.pageLayout'],
          'item_category4': productsArray[i].gameDetails,
          'item_category5': productsArray[i].bet_details,
          'price': productsArray[i].price ? (productsArray[i].price * 0.01) : undefined,
          'affiliation': productsArray[i].transactionAffiliate,
          'item_list_id': 'sports_betting',
          'item_list_name': 'Sports Betting',
          'bet_odds': productsArray[i].odds,
          'bet_promo': productsArray[i].insurance,
          'bet_event_id': productsArray[i].sku ? productsArray[i].sku.split('-')[2] : undefined,
          'prod_module_name': productsArray[i]['component.moduleName'] ? productsArray[i]['component.moduleName'].toLowerCase() : undefined,
          'prod_module_position': productsArray[i]['component.modulePosition'] ? productsArray[i]['component.modulePosition'].toLowerCase() : undefined,
          'prod_content_position': productsArray[i]['component.ContentPosition'],
          'prod_market_id': productsArray[i].marketID,
          'prod_results_id': productsArray[i].resultID,
          'prod_module_cust_name': productsArray[i]['component.moduleCustName'],
          'prod_module_competition_config': productsArray[i]['component.moduleCompetitionConfig'],
          'prod_module_affiliation_config': productsArray[i]['component.moduleAffiliationConfig'],
          'prod_module_sports_config': productsArray[i]['component.moduleSportsConfig'],
          'prod_module_source': productsArray[i]['component.moduleSource'],
          'bet_type_system': productsArray[i].systemBetType,
          'bet_request_id': productsArray[i].betRequestID,
          'prod_betslip_id': productsArray[i].betslipID,
          'prod_league_id': productsArray[i].leagueID,
          'prod_module_user_segment': productsArray[i]['component.userSegment'],
          'prod_marquee_name': productsArray[i].marqueeName ? productsArray[i].marqueeName.toLowerCase() : undefined,
          'prod_marquee_type': productsArray[i].marqueeType ? productsArray[i].marqueeType.toLowerCase() : undefined,
          'prod_marquee_content_logic': productsArray[i]['marquee.contentLogic'],
          'prod_recommendation_type': productsArray[i]['component.recommendationtype'] ? productsArray[i]['component.recommendationtype'].toLowerCase() : undefined,
          'bet_tracking_type': productsArray[i].bet_tracking_type,
          'bet_type': productsArray[i].bet_type,
          'location_id': productsArray[i].location_id,
          'quantity': 1
        });
      }
    }
  }
  finalItems = jsonData;
  break;
    
  default:
    log('Event type "' + eventType + '" not configured.', 'warn');
}

log('Final mapped items: ' + JSON.stringify(finalItems), 'info');

// Return the final items array
return finalItems;