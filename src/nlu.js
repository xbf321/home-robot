import dialogflow from '@google-cloud/dialogflow';
import { v4 as uuidv4 } from 'uuid';
import path from 'node:path';
import { consola } from 'consola';

import { NLUProvider } from './utils/constant.js';
import config from './utils/config.js';

class AbstractNLU {
  constructor() {}
}

class Dialogflow extends AbstractNLU {
  constructor() {
    super();
    process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(process.cwd(), config.nlu.provider.dialogflow.credentialsPath);
    this.sessionClient = new dialogflow.SessionsClient();
  }
  async _detectIntent(
    query,
    contexts,
  ) {
    const projectId = config.nlu.provider.dialogflow.projectId;
    const sessionId = uuidv4();
    const languageCode = 'zh-cn';
    // The path to identify the agent that owns the created intent.
    const sessionPath = this.sessionClient.projectAgentSessionPath(
      projectId,
      sessionId
    );
  
    // The text query request.
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: query,
          languageCode,
        },
      },
    };
  
    if (contexts && contexts.length > 0) {
      request.queryParams = {
        contexts: contexts,
      };
    }
  
    const responses = await this.sessionClient.detectIntent(request);
    return responses[0] || {};
  }

  // 进行 NLU 解析
  async parse(query) {
    const response = await this._detectIntent(query);
    const { queryText, intent } = (response || {}).queryResult || {};
    const { parameters, displayName: intentName } = intent || {};
    const logMessage = JSON.stringify({
      queryText,
      intentName,
      parameters,
    });
    consola.info(`执行 NLU 解析，结果：${logMessage}`);
    return response;
  }

  // 提取意图
  getIntent(parsed) {
    if (parsed.queryResult && parsed.queryResult.intent) {
      return parsed.queryResult.intent;
    }
    return '';
  }

  // 判断是否包含某个意图
  hasIntent(parsed, intent) {
    if (parsed.queryResult && parsed.queryResult.intent) {
      return parsed.queryResult.intent['displayName'] === intent;
    }
    return false;
  }

  getParameters(parsed) {
    if (parsed.queryResult && parsed.queryResult.parameters && parsed.queryResult.parameters.fields) {
      return parsed.queryResult.parameters.fields;
    }
    return {};
  }
  getParameter(parsed, parameterName) {
    const parameters = this.getParameters(parsed);
    const { kind } = parameters[parameterName] || {};
    if (!kind) {
      return null;
    }
    if (kind === 'stringValue') {
      return parameters[parameterName][kind];
    }
    if (kind === 'structValue') {
      return parameters[parameterName][kind].fields
    }
    return null;
  }
}

class NLUFactory {
  static createInstance(providerName = NLUProvider.Dialogflow) {
    let provider = null;
    switch (providerName) {
      case NLUProvider.Dialogflow:
        provider = new Dialogflow();
        break;
      default:
        provider = null;
        break;
    }
    if (!provider) {
      throw new Error('NLU is null.');
    }
    return provider;
  }
}

export default NLUFactory;