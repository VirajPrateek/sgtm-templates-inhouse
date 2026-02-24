const _logModule = require('logToConsole');
const LOG_ENABLED = false;
const log = (msg, type) => {
  if (LOG_ENABLED) {
    _logModule(msg, type);
  }
};
const JSON = require('JSON');

// Lookup table for sport IDs
var sportIDs = {
  4: 'football', 5: 'tennis', 6: 'formula1', 7: 'basketball', 9: 'alpine skiing', 10: 'cycling',
  11: 'american football', 12: 'ice hockey', 13: 'golf', 14: 'nordic ski', 15: 'motorsports',
  16: 'handball', 17: 'athletics', 18: 'volleyball', 21: 'rugby', 22: 'cricket', 23: 'baseball',
  24: 'boxing', 25: 'specials', 26: 'the olympics - specials', 27: 'bandy', 28: 'floorball',
  29: 'horse racing', 30: 'trotting', 31: 'rugby league', 32: 'rugby union', 33: 'snooker',
  34: 'darts', 35: 'bowls', 36: 'aussie rules', 37: 'greyhounds', 38: 'pool', 39: 'nascar',
  40: 'motorbikes', 41: 'motorsport', 42: 'speedway', 43: 'rally', 44: 'badminton',
  45: 'combat sports', 46: 'equestrian', 47: 'fistball', 48: 'gaelic sports', 49: 'hockey',
  50: 'squash', 51: 'swimming', 52: 'water polo', 53: 'softball', 54: 'sailing', 55: 'rowing',
  56: 'table tennis', 57: 'weightlifting', 58: 'archery', 59: 'gymnastics', 60: 'entertainment',
  61: 'politics', 62: 'financials', 63: 'beach volleyball', 64: 'biathlon', 65: 'bobsleigh',
  66: 'canoeing', 67: 'chess', 68: 'curling', 69: 'figure skating', 70: 'futsal',
  71: 'indoor football', 72: 'luge', 73: 'netball', 74: 'pelota', 75: 'petanque',
  76: 'poker betting', 77: 'rink hockey', 78: 'fencing', 79: 'shooting',
  80: 'show jumping', 81: 'skeleton', 82: 'snowboarding', 83: 'speed skating',
  84: 'triathlon', 85: 'ten pin bowling', 86: 'freestyle skiing', 87: 'padel tennis',
  88: 'lacrosse', 89: 'schwingen', 90: 'table football', 91: 'motocross', 92: 'diving',
  93: 'beach football', 94: 'cross country skiing', 95: 'ski jumping',
  96: 'nordic combined', 97: 'beach handball', 98: 'modern pentathlon',
  99: 'wrestling', 100: 'esports', 101: 'virtual football', 102: 'virtual tennis',
  103: 'virtual basketball', 104: 'virtual american football', 105: 'cs2',
  106: 'league of legends', 107: 'dota 2', 108: 'esoccer', 109: 'surfing',
  110: 'x1 football', 111: 'pickleball', 112: 'footvolley', 113: 'breaking',
  114: 'judo', 115: 'modern pentathlon', 116: 'skateboarding',
  117: 'sport climbing', 118: 'taekwondo',
  501: 'rodeo', 1001: 'virtual sports', 1002: 'football simulated reality',
  1010: 'apex', 1011: 'artifact', 1014: 'call of duty',
  1016: 'Counter strike: go', 1017: 'dota 2', 1018: 'csgo faceit',
  1019: 'fifa', 1020: 'fortnite', 1021: 'fortnitemobile',
  1022: 'fortnite normals', 1024: 'freefire', 1025: 'ggst',
  1026: 'gears of war', 1027: 'halo 5', 1028: 'injustice2',
  1029: 'king of glory', 1030: 'league of legends', 1031: 'mk11',
  1032: 'age Of empires II', 1033: 'mvc2', 1034: 'nba jam',
  1035: 'nba2k', 1036: 'novelty', 1037: 'overwatch',
  1038: 'pubg', 1039: 'rainbow six siege', 1040: 'rocket league',
  1041: 'starcraft 2', 1042: 'starcraft brood wars', 1043: 'sfv',
  1044: 'aov', 1045: 'splitgate', 1046: 'tft', 1047: 'ufc3',
  1048: 'ufc4', 1049: 'valorant', 1050: 'rainbow6',
  1051: 'wild rift', 1052: 'cod : warzone', 1053: 'nfl',
  1054: 'ufc', 1055: 'tekken', 1060: 'fishing',
  1061: 'karate', 1062: 'mythical matches',
  1063: 'short track speed skating', 1064: 'sport climbing'
};


// Get template parameters
const eventType = data.eventType;
const realEventName = data.eventName;
const componentModuleCustName = data.componentModuleCustName || 'na';

let parsedDataLayer = data.parsedData || {};
if (typeof parsedDataLayer === 'string') {
  parsedDataLayer = JSON.parse(parsedDataLayer);
}

const componentModulePosition = parsedDataLayer['component.modulePosition'];
const componentModuleName = parsedDataLayer['component.moduleName'];
const marketID = parsedDataLayer['marketID'];
const resultID = parsedDataLayer['resultID'];
const componentContentPosition = parsedDataLayer['component.ContentPosition'];
const componentPageLayout = parsedDataLayer['component.pageLayout'];
const componentModuleSource = parsedDataLayer['component.moduleSource'];
const componentUserSegment = parsedDataLayer['component.userSegment'];
const sportID = parsedDataLayer['sportID'];
const marqueeName = parsedDataLayer['marqueeName'];
const marqueeType = parsedDataLayer['marqueeType'];
const sitecoreTemplateId = parsedDataLayer['page.sitecoretemplateid'];
const marqueeContentLogic = parsedDataLayer['marquee.contentLogic'];
const componentRecommendationType = parsedDataLayer['component.recommendationtype'];

// Final GA4 Items array to be returned
let finalItems = [];
let jsonData = null;
let productsArray = [];
const safeTransactionProducts = data.transactionProducts || {};

// Map based on event type - exact same logic as client side
switch (eventType) {
  case 'Cart.betAdded':
    jsonData = {};
    jsonData.item_name = safeTransactionProducts['product.pickDetails'].split(';')[0];
    jsonData.item_id = data.item_id;
    jsonData.item_brand = safeTransactionProducts['name'];
    jsonData.item_category = data.item_category;
    jsonData.item_variant = safeTransactionProducts['product.pickDetails'].split(';')[1] + ';' + safeTransactionProducts['product.pickDetails'].split(';')[2];
    jsonData.item_selected = safeTransactionProducts['product.pickDetails'].split(';')[2];
    jsonData.item_category3 = safeTransactionProducts['component.pageLayout'];
    jsonData.item_category4 = safeTransactionProducts['gameDetails'];
    jsonData.item_category5 = safeTransactionProducts['bet_details'];
    jsonData.price = safeTransactionProducts['price'];
    jsonData.item_list_id = 'sports_betting';
    jsonData.item_list_name = 'Sports Betting';
    jsonData.affiliation = safeTransactionProducts.transactionAffiliation;
    jsonData.bet_event_id = safeTransactionProducts.sku.split('-')[2];
    jsonData.prod_module_name = safeTransactionProducts['component.moduleName'] ? safeTransactionProducts['component.moduleName'].toLowerCase() : undefined;
    jsonData.prod_module_position = safeTransactionProducts['component.modulePosition'] ? safeTransactionProducts['component.modulePosition'].toLowerCase() : undefined;
    jsonData.prod_content_position = safeTransactionProducts['component.ContentPosition'] ? safeTransactionProducts['component.ContentPosition'].toLowerCase() : undefined;
    jsonData.prod_market_id = safeTransactionProducts.marketID;
    jsonData.prod_results_id = safeTransactionProducts.resultID;
    jsonData.prod_module_cust_name = safeTransactionProducts['component.moduleCustName'] ? safeTransactionProducts['component.moduleCustName'].toLowerCase() : undefined;
    jsonData.prod_module_competition_config = safeTransactionProducts['component.moduleCompetitionConfig'] ? safeTransactionProducts['component.moduleCompetitionConfig'].toLowerCase() : undefined;
    jsonData.prod_module_affiliation_config = safeTransactionProducts['component.moduleAffiliationConfig'] ? safeTransactionProducts['component.moduleAffiliationConfig'].toLowerCase() : undefined;
    jsonData.prod_module_sports_config = safeTransactionProducts['component.moduleSportsConfig'] ? safeTransactionProducts['component.moduleSportsConfig'].toLowerCase() : undefined;
    jsonData.prod_module_source = safeTransactionProducts['component.moduleSource'] ? safeTransactionProducts['component.moduleSource'].toLowerCase() : undefined;
    jsonData.prod_module_user_segment = safeTransactionProducts['component.userSegment'] ? safeTransactionProducts['component.userSegment'].toLowerCase() : undefined;
    jsonData.prod_league_id = safeTransactionProducts['leagueID'] ? safeTransactionProducts['leagueID'].toLowerCase() : undefined;
    jsonData.prod_marquee_name = safeTransactionProducts['marqueeName'] ? safeTransactionProducts['marqueeName'].toLowerCase() : undefined;
    jsonData.prod_marquee_type = safeTransactionProducts['marqueeType'] ? safeTransactionProducts['marqueeType'].toLowerCase() : undefined;
    jsonData.prod_marquee_content_logic = safeTransactionProducts['marquee.contentLogic'] ? safeTransactionProducts['marquee.contentLogic'].toLowerCase() : undefined;
    jsonData.bet_selections_in_slip = safeTransactionProducts['selectionsInSlip'];
    jsonData.quantity = 1;
    jsonData.bet_type = safeTransactionProducts['bet_type'] ? safeTransactionProducts['bet_type'].toLowerCase() : undefined;
    jsonData.location_id = safeTransactionProducts['location_id'] ? safeTransactionProducts['location_id'].toLowerCase() : undefined;
    finalItems.push(jsonData);
    break;

  case 'select_item':
    jsonData = {};
    if (componentModuleCustName && componentModuleCustName !== 'na') {
      jsonData.item_name = (componentModuleCustName || 'na').toLowerCase();
      jsonData.item_brand = (componentModuleCustName || 'na').toLowerCase();
      jsonData.item_id = safeTransactionProducts.sku;
      jsonData.item_category = (componentModulePosition || 'na').split("|")[0].toLowerCase();
      jsonData.price = 'not applicable';
      jsonData.index = (componentModulePosition || 'na').split("|")[1];
      jsonData.item_list_id = 'sports_module';
      jsonData.item_list_name = 'Sports Module';
      jsonData.item_variant = sportIDs[sportID];
      jsonData.prod_module_name = (componentModuleName || 'na').toLowerCase();
      jsonData.prod_module_position = (componentModulePosition || 'na').toLowerCase();
      jsonData.prod_market_id = marketID || 'na';
      jsonData.prod_result_id = resultID || 'na';
      jsonData.prod_content_position = componentContentPosition;
      jsonData.item_category3 = (componentPageLayout || 'na').toLowerCase();
      jsonData.prod_module_cust_name = (componentModuleCustName || 'na').toLowerCase();
      jsonData.prod_module_competition_config = safeTransactionProducts['component.moduleCompetitionConfig'];
      jsonData.prod_module_affiliation_config = safeTransactionProducts['component.moduleAffiliationConfig'];
      jsonData.prod_module_sports_config = safeTransactionProducts['component.moduleSportsConfig'];
      jsonData.prod_module_source = (componentModuleSource || 'na').toLowerCase();
      jsonData.item_category_4 = safeTransactionProducts['gameDetails'];
      jsonData.prod_league_id = safeTransactionProducts['leagueID'];
      jsonData.prod_module_user_segment = (componentUserSegment || 'na').toLowerCase();
      jsonData.prod_recommendation_type = safeTransactionProducts['component.recommendationtype'];
      jsonData.prod_marquee_content_logic = safeTransactionProducts['marquee.contentLogic'];
    }
    else {
      jsonData.item_name = (safeTransactionProducts['component.moduleCustName'] || 'na').toLowerCase();
      jsonData.item_brand = (safeTransactionProducts['component.moduleCustName'] || 'na').toLowerCase();
      jsonData.item_id = safeTransactionProducts.sku;
      jsonData.item_category = (safeTransactionProducts['component.modulePosition'] || 'na').split("|")[0].toLowerCase();
      jsonData.price = 'not applicable';
      jsonData.index = (safeTransactionProducts['component.modulePosition'] || 'na').split("|")[1];
      jsonData.item_list_id = 'sports_module';
      jsonData.item_list_name = 'Sports Module';
      jsonData.item_variant = sportIDs[safeTransactionProducts['sportID']];
      jsonData.prod_module_name = safeTransactionProducts['component.moduleName'];
      jsonData.prod_module_position = safeTransactionProducts['component.modulePosition'];
      jsonData.prod_market_id = safeTransactionProducts.marketID || 'na';
      jsonData.prod_result_id = safeTransactionProducts.resultID || 'na';
      jsonData.prod_content_position = safeTransactionProducts['component.ContentPosition'];
      jsonData.item_category3 = safeTransactionProducts['component.pageLayout'];
      jsonData.prod_module_cust_name = safeTransactionProducts['component.moduleCustName'];
      jsonData.prod_module_competition_config = safeTransactionProducts['component.moduleCompetitionConfig'];
      jsonData.prod_module_affiliation_config = safeTransactionProducts['component.moduleAffiliationConfig'];
      jsonData.prod_module_sports_config = safeTransactionProducts['component.moduleSportsConfig'];
      jsonData.prod_module_source = safeTransactionProducts['component.moduleSource'];
      jsonData.item_category_4 = safeTransactionProducts['gameDetails'];
      jsonData.prod_league_id = safeTransactionProducts['leagueID'];
      jsonData.prod_module_user_segment = (safeTransactionProducts['component.userSegment'] || 'na').toLowerCase();
      jsonData.prod_recommendation_type = safeTransactionProducts['component.recommendationtype'];
      jsonData.prod_marquee_content_logic = safeTransactionProducts['marquee.contentLogic'];
    }
    jsonData.quantity = 1;
    finalItems.push(jsonData);
    break;

  case 'select_item-Mar':
    jsonData = {};
    if (componentModuleCustName && componentModuleCustName !== 'na') {
      jsonData.item_name = (marqueeName || 'na').toLowerCase();
      jsonData.item_category = sportIDs[sportID];
      jsonData.item_variant = sitecoreTemplateId || 'na';
      jsonData.item_brand = marqueeType || 'na';
      jsonData.index = componentContentPosition || 'na';
      jsonData.item_list_id = 'marquees';
      jsonData.item_list_name = 'Marquees';
      jsonData.prod_marquee_name = jsonData.item_name;
      jsonData.prod_marquee_type = (marqueeType || 'na').toLowerCase();
      jsonData.prod_module_name = (componentModuleName || 'na').toLowerCase();
      jsonData.prod_module_position = (componentModulePosition || 'na').toLowerCase();
      jsonData.item_category3 = (componentPageLayout || 'na').toLowerCase();
      jsonData.prod_module_cust_name = (componentModuleCustName || 'na').toLowerCase();
      jsonData.prod_module_source = (componentModuleSource || 'na').toLowerCase();
      jsonData.prod_module_recommendation_type = (componentRecommendationType || 'na').toLowerCase();
    }
    else {
      jsonData.item_name = (safeTransactionProducts['marqueeName'] || 'na').toLowerCase();
      jsonData.item_id = safeTransactionProducts.sku || 'na';
      jsonData.item_category = sportIDs[safeTransactionProducts['sportID']];
      jsonData.item_brand = (safeTransactionProducts['marqueeType'] || 'na').toLowerCase();
      jsonData.item_list_id = 'marquees';
      jsonData.item_list_name = 'Marquees';

      if (realEventName === 'Cart.betAdded') {
        jsonData.item_variant = (safeTransactionProducts['page.sitecoretemplateid'] || 'na').toLowerCase();
      } else {
        jsonData.item_variant = (safeTransactionProducts['marquee.contentLogic'] || 'na').toLowerCase();
      }

      jsonData.prod_marquee_name = (safeTransactionProducts['marqueeName'] || 'na').toLowerCase();
      jsonData.prod_marquee_type = (safeTransactionProducts['marqueeType'] || 'na').toLowerCase();
      jsonData.prod_module_name = (safeTransactionProducts['component.moduleName'] || 'na').toLowerCase();
      jsonData.prod_module_position = (safeTransactionProducts['component.modulePosition'] || 'na').toLowerCase();
      jsonData.item_category3 = (safeTransactionProducts['component.pageLayout'] || 'na').toLowerCase();
      jsonData.prod_module_cust_name = (safeTransactionProducts['component.moduleCustName'] || 'na').toLowerCase();
      jsonData.prod_module_source = (safeTransactionProducts['component.moduleSource'] || 'na').toLowerCase();
      jsonData.prod_recommendation_type = (safeTransactionProducts['component.recommendationtype'] || 'na').toLowerCase();
      jsonData.quantity = 1;
    }
    finalItems.push(jsonData);
    break;

  case 'select_item-NR':
    jsonData = {};
    if (componentModuleCustName && componentModuleCustName !== 'na') {
      jsonData.item_name = (componentModuleCustName || 'na').toLowerCase();
      jsonData.item_category = (componentModulePosition || 'na').split("|")[0].toLowerCase();
      jsonData.item_brand = (componentModulePosition || 'na').toLowerCase();
      jsonData.index = (componentModulePosition || 'na').split("|")[1];
      jsonData.price = 'not applicable';
      jsonData.item_list_id = 'next_races';
      jsonData.item_list_name = 'Next Races';
      jsonData.prod_module_name = (componentModuleName || 'na').toLowerCase();
      jsonData.prod_module_position = (componentModulePosition || 'na').toLowerCase();
      jsonData.item_category3 = (componentPageLayout || 'na').toLowerCase();
      jsonData.prod_module_cust_name = (componentModuleCustName || 'na').toLowerCase();
      jsonData.prod_module_source = (componentModuleSource || 'na').toLowerCase();
      jsonData.prod_module_user_segment = (componentUserSegment || 'na').toLowerCase();
    }
    else {
      jsonData.item_name = (safeTransactionProducts['component.moduleCustName'] || 'na').toLowerCase();
      jsonData.item_id = safeTransactionProducts.sku || 'na';
      jsonData.item_category = (safeTransactionProducts['component.modulePosition'] || 'na').split("|")[0].toLowerCase();
      jsonData.price = 'not applicable';
      jsonData.index = (safeTransactionProducts['component.modulePosition'] || 'na').split("|")[1];
      jsonData.item_list_id = 'next_races';
      jsonData.item_list_name = 'Next Races';
      jsonData.item_variant = sportIDs[safeTransactionProducts['sportID']];
      jsonData.quantity = 1;
    }
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
    productsArray = data.transactionProducts;
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
            'price': productsArray[i].price ? (productsArray[i].price * 0.01) : 0,
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
    productsArray = data.transactionProducts;
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

  case 'Cart.checkout':
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

  case 'purchaseComplete':
    jsonData = [];
    productsArray = data.transactionProducts;
    if (productsArray && productsArray.length > 0) {
      for (let i = 0; i < productsArray.length; i++) {
        if (productsArray[i] !== undefined) {
          jsonData.push({
            'item_name': productsArray[i].name,
            'item_brand': productsArray[i].brand,
            'item_category': productsArray[i].category,
            'item_variant': productsArray[i].variant,
            'item_list_id': 'bingo',
            'item_list_name': 'bingo',
            'item_coupon': productsArray[i].coupon,
            'price': productsArray[i].price,
            'quantity': productsArray[i].quantity
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