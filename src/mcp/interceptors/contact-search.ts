import type { CallInterceptor, CallContext, BeforeCallOptions } from "./types.js";

interface GetUserlistResult {
  errcode?: number;
  errmsg?: string;
  userlist?: Array<{
    userid?: string;
    name?: string;
    alias?: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

export const contactSearchInterceptor: CallInterceptor = {
  name: "contact-search",
  match(ctx: CallContext) {
    // 仅拦截 contact 品类的 get_userlist 方法
    return ctx.category === "contact" && ctx.method === "get_userlist";
  },
  beforeCall(_ctx: CallContext): BeforeCallOptions {
    // 拦截发往 MCP Server 的请求，剔除 keyword 参数，避免底层 Server 校验报错
    // 强制传空对象 {} 以获取全量列表（或者按底层实际要求传参）
    return {
      args: {}
    };
  },
  afterCall(ctx: CallContext, result: unknown) {
    // 获取 LLM 传入的搜索关键词
    const keyword = ctx.args?.keyword as string | undefined;
    const typedResult = result as GetUserlistResult | null | undefined;

    // 如果没有传入关键词，或者返回的不是预期数组，直接返回原结果
    if (!keyword || !typedResult || !Array.isArray(typedResult.userlist)) {
      return result;
    }

    const lowerKeyword = keyword.toLowerCase();

    // 在 Node.js 内存中进行过滤，防止大量无关人员数据泄漏给 LLM
    const filteredUsers = typedResult.userlist.filter((user) => {
      const nameMatch = user.name && String(user.name).toLowerCase().includes(lowerKeyword);
      const aliasMatch = user.alias && String(user.alias).toLowerCase().includes(lowerKeyword);
      return nameMatch || aliasMatch;
    });

    // 仅返回匹配的结果（为防止重名过多，可截断前 10 个）
    return {
      ...typedResult,
      userlist: filteredUsers.slice(0, 10),
      _meta: `已在底层为您拦截并根据关键词 "${keyword}" 过滤，共找到 ${filteredUsers.length} 个匹配结果。`
    };
  }
};
