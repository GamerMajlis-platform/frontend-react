💬 Chat System APIs
60. Create Chat Room
API: POST /api/chat/rooms

Body (form-data):

name: Gaming Squad Chat
description: Chat room for our gaming squad (optional)
type: GROUP (optional, default: GROUP)
isPrivate: false (optional, default: false)
maxMembers: 50 (optional)
gameTitle: Valorant (optional)
tournamentId: 1 (optional)
eventId: 1 (optional)
Expected Output:

{
  "success": true,
  "message": "Chat room created successfully",
  "chatRoom": {
    "id": 1,
    "name": "Gaming Squad Chat",
    "description": "Chat room for our gaming squad",
    "type": "GROUP",
    "isPrivate": false,
    "maxMembers": 50,
    "currentMembers": 1,
    "gameTitle": "Valorant",
    "tournamentId": 1,
    "eventId": 1,
    "creator": {
      "id": 1,
      "displayName": "GamerUser",
      "profilePictureUrl": "/uploads/profile-pictures/profile_1.jpg"
    },
    "isActive": true,
    "allowFileSharing": true,
    "allowEmojis": true,
    "messageHistoryDays": 30,
    "totalMessages": 0,
    "createdAt": "2024-12-21T16:00:00",
    "lastActivity": "2024-12-21T16:00:00"
  }
}
61. Get User Chat Rooms
API: GET /api/chat/rooms?page=0&size=20

Body: None (requires Authorization header)

Expected Output:

{
  "success": true,
  "message": "Chat rooms retrieved successfully",
  "chatRooms": [
    {
      "id": 1,
      "name": "Gaming Squad Chat",
      "type": "GROUP",
      "isPrivate": false,
      "currentMembers": 5,
      "gameTitle": "Valorant",
      "lastActivity": "2024-12-21T16:30:00",
      "lastMessage": {
        "id": 10,
        "content": "GG everyone!",
        "sender": {
          "id": 2,
          "displayName": "TeamMate"
        },
        "createdAt": "2024-12-21T16:30:00"
      }
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "currentPage": 0,
  "pageSize": 20
}
62. Get Chat Room Details
API: GET /api/chat/rooms/{roomId}

Body: None (requires Authorization header)

Expected Output:

{
  "success": true,
  "message": "Chat room details retrieved",
  "chatRoom": {
    "id": 1,
    "name": "Gaming Squad Chat",
    "description": "Chat room for our gaming squad",
    "type": "GROUP",
    "isPrivate": false,
    "maxMembers": 50,
    "currentMembers": 5,
    "gameTitle": "Valorant",
    "creator": {
      "id": 1,
      "displayName": "GamerUser",
      "profilePictureUrl": "/uploads/profile-pictures/profile_1.jpg"
    },
    "moderatorIds": [1],
    "members": [
      {
        "id": 1,
        "user": {
          "id": 1,
          "displayName": "GamerUser",
          "profilePictureUrl": "/uploads/profile-pictures/profile_1.jpg"
        },
        "role": "ADMIN",
        "joinedAt": "2024-12-21T16:00:00"
      }
    ],
    "allowFileSharing": true,
    "allowEmojis": true,
    "slowModeSeconds": null,
    "totalMessages": 15,
    "createdAt": "2024-12-21T16:00:00",
    "lastActivity": "2024-12-21T16:30:00"
  }
}
63. Join Chat Room
API: POST /api/chat/rooms/{roomId}/join

Body: None (requires Authorization header)

Expected Output:

{
  "success": true,
  "message": "Successfully joined chat room",
  "membership": {
    "id": 2,
    "user": {
      "id": 2,
      "displayName": "NewMember"
    },
    "role": "MEMBER",
    "joinedAt": "2024-12-21T17:00:00"
  }
}
64. Leave Chat Room
API: POST /api/chat/rooms/{roomId}/leave

Body: None (requires Authorization header)

Expected Output:

{
  "success": true,
  "message": "Successfully left chat room"
}
65. Send Message
API: POST /api/chat/rooms/{roomId}/messages

Body (multipart/form-data):

content: Hello everyone! Ready for the tournament?
messageType: TEXT (optional, default: TEXT)
replyToMessageId: 5 (optional)
file: [optional file attachment - images/videos/audio/pdf/text, max 10MB]
Expected Output:

{
  "success": true,
  "message": "Message sent successfully",
  "chatMessage": {
    "id": 16,
    "content": "Hello everyone! Ready for the tournament?",
    "messageType": "TEXT",
    "sender": {
      "id": 1,
      "displayName": "GamerUser",
      "profilePictureUrl": "/uploads/profile-pictures/profile_1.jpg"
    },
    "chatRoom": {
      "id": 1,
      "name": "Gaming Squad Chat"
    },
    "replyToMessageId": 5,
    "fileUrl": null,
    "fileName": null,
    "fileSize": null,
    "createdAt": "2024-12-21T17:15:00",
    "updatedAt": "2024-12-21T17:15:00"
  }
}
66. Get Chat Messages
API: GET /api/chat/rooms/{roomId}/messages?page=0&size=50&beforeMessageId=20&afterMessageId=5

Body: None (requires Authorization header)

Expected Output:

{
  "success": true,
  "message": "Messages retrieved successfully",
  "messages": [
    {
      "id": 16,
      "content": "Hello everyone! Ready for the tournament?",
      "messageType": "TEXT",
      "sender": {
        "id": 1,
        "displayName": "GamerUser",
        "profilePictureUrl": "/uploads/profile-pictures/profile_1.jpg"
      },
      "replyToMessage": {
        "id": 5,
        "content": "When does the tournament start?",
        "sender": {
          "id": 2,
          "displayName": "TeamMate"
        }
      },
      "fileUrl": null,
      "createdAt": "2024-12-21T17:15:00"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "currentPage": 0,
  "pageSize": 50
}
67. Delete Message
API: DELETE /api/chat/messages/{messageId}

Body: None (requires Authorization header)

Expected Output:

{
  "success": true,
  "message": "Message deleted successfully"
}
68. Add Chat Room Member
API: POST /api/chat/rooms/{roomId}/members/{memberId}

Body (form-data):

role: MEMBER (optional, default: MEMBER)
Expected Output:

{
  "success": true,
  "message": "Member added successfully",
  "membership": {
    "id": 3,
    "user": {
      "id": 3,
      "displayName": "NewPlayer"
    },
    "role": "MEMBER",
    "joinedAt": "2024-12-21T17:30:00"
  }
}
69. Remove Chat Room Member
API: DELETE /api/chat/rooms/{roomId}/members/{memberId}

Body: None (requires Authorization header)

Expected Output:

{
  "success": true,
  "message": "Member removed successfully"
}
70. Get Chat Room Members
API: GET /api/chat/rooms/{roomId}/members?page=0&size=20

Body: None (requires Authorization header)

Expected Output:

{
  "success": true,
  "message": "Members retrieved successfully",
  "members": [
    {
      "id": 1,
      "user": {
        "id": 1,
        "displayName": "GamerUser",
        "profilePictureUrl": "/uploads/profile-pictures/profile_1.jpg"
      },
      "role": "ADMIN",
      "joinedAt": "2024-12-21T16:00:00",
      "lastSeen": "2024-12-21T17:30:00",
      "isOnline": true
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "currentPage": 0,
  "pageSize": 20
}
71. Start Direct Message
API: POST /api/chat/direct

Body (form-data):

recipientId: 2
Expected Output:

{
  "success": true,
  "message": "Direct message conversation started",
  "chatRoom": {
    "id": 10,
    "name": "Direct Message",
    "type": "DIRECT_MESSAGE",
    "isPrivate": true,
    "currentMembers": 2,
    "members": [
      {
        "id": 1,
        "displayName": "GamerUser"
      },
      {
        "id": 2,
        "displayName": "FriendUser"
      }
    ],
    "createdAt": "2024-12-21T18:00:00"
  }
}
72. Get Online Users
API: GET /api/chat/online-users

Body: None (requires Authorization header)

Expected Output:

{
  "success": true,
  "message": "Online users retrieved",
  "onlineUsers": [
    {
      "id": 2,
      "displayName": "FriendUser",
      "profilePictureUrl": "/uploads/profile-pictures/profile_2.jpg",
      "status": "ONLINE",
      "lastSeen": "2024-12-21T18:00:00"
    },
    {
      "id": 3,
      "displayName": "GamerFriend",
      "profilePictureUrl": "/uploads/profile-pictures/profile_3.jpg",
      "status": "IN_GAME",
      "currentGame": "Valorant",
      "lastSeen": "2024-12-21T17:45:00"
    }
  ]
}
73. Send Typing Indicator
API: POST /api/chat/typing

Body (form-data):

roomId: 1
isTyping: true (optional, default: true)
Expected Output:

{
  "success": true,
  "message": "Typing indicator sent",
  "roomId": 1,
  "isTyping": true
}