---
name: wecom-contact-lookup
description: 通讯录成员查询技能，基于 MCP tool 协议封装的 `get_userlist` 接口，支持向接口传入 keyword 关键词，在底层精准检索并返回匹配的成员信息。
---

# 通讯录成员查询技能

通过 MCP tool 协议封装的 `get_userlist` 接口，传入 `keyword` 关键词即可精准获取目标人员的 `userid` 和姓名。

## 操作

### 1. 按关键词搜索人员（强烈推荐）

为了避免大企业通讯录人数过多导致异常，**调用时必须传入 `keyword` 参数**。

**调用示例：**

用户问："帮我找一下张三是谁？"
使用 `wecom_mcp` tool 调用 `wecom_mcp call contact get_userlist '{"keyword": "张三"}'`

**返回格式：**

```json
{
    "errcode": 0,
    "errmsg": "ok",
    "userlist": [
        {
            "userid": "zhangsan",
            "name": "张三",
            "alias": "Sam"
        }
    ]
}
```

## 注意事项

- `userid` 是用户的唯一标识，在需要传递用户 ID 给其他接口时使用此字段
- 若搜索结果有多个同名人员，需将所有候选人展示给用户选择，不得自行决定
- **禁止传入空对象 `{}`**，必须从用户的上下文中提取姓名作为 `keyword` 参数传入。

---

## 典型工作流

### 工作流 1：为其他功能提供 userid 转换

用户问："帮我发消息给张三"

1. 使用 `wecom_mcp` tool 调用 `wecom_mcp call contact get_userlist '{"keyword": "张三"}'` 获取匹配成员
2. 确认返回列表中的 `userid`
3. 将 `userid` 传递给消息发送等后续业务接口
