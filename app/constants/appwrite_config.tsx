"use client";

import { Client, Account, Models, ID, Databases, Storage } from "appwrite";
import { User } from "./interface";
import sdk, { Permission, Role } from "node-appwrite";

interface Sponsor {
  id: number;
  name: string;
  url: string;
}

class ServerConfig {
  client: sdk.Client = new sdk.Client();
  databaseId: string = process.env.NEXT_PUBLIC_DATABASEID || "";
  regCollId: string = process.env.NEXT_PUBLIC_REGDB || "";
  sponCollId: string = process.env.NEXT_PUBLIC_SPODB || "";
  databases: sdk.Databases = new sdk.Databases(this.client);

  constructor() {
    this.client
      .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT || "")
      .setProject(process.env.NEXT_PUBLIC_PROJECTID || "")
      .setKey(process.env.NEXT_PUBLIC_DBKEY || "");
  }

  async createRegColl(id: string, name: string) {
    try {
      await this.databases.createCollection(this.databaseId, id, name, [
        Permission.read(Role.any()),
        Permission.update(Role.any()),
        Permission.create(Role.any()),
        Permission.delete(Role.any()),
      ]);

      await this.databases.createStringAttribute(this.databaseId, id, "name", 50, false);
      await this.databases.createStringAttribute(this.databaseId, id, "email", 50, false);
      await this.databases.createStringAttribute(this.databaseId, id, "confirm", 50, false, "");
    } catch (error) {
      console.error("Error creating registration collection:", error);
    }
  }

  async createSponColl(id: string, name: string, sponsors: Sponsor[], user: string) {
    try {
      await this.databases.createCollection(this.databaseId, id, name, [
        Permission.read(Role.any()),
        Permission.update(Role.user(user)),
        Permission.create(Role.user(user)),
        Permission.delete(Role.user(user)),
      ]);

      await this.databases.createStringAttribute(this.databaseId, id, "name", 50, false);
      await this.databases.createStringAttribute(this.databaseId, id, "url", 50, false);
      
      for (const sponsor of sponsors) {
        await this.databases.createDocument(this.databaseId, id, ID.unique(), {
          name: sponsor.name,
          url: sponsor.url,
        });
      }
    } catch (error) {
      console.error("Error creating sponsor collection:", error);
    }
  }
}

class AppwriteConfig {
  databaseId: string = process.env.NEXT_PUBLIC_DATABASEID || "";
  activeCollId: string = process.env.NEXT_PUBLIC_EVENT_COLLID || "";
  bannerBucketId: string = process.env.NEXT_PUBLIC_EVENTBUCKET || "";

  client: Client = new Client();
  account: Account = new Account(this.client);
  databases: Databases = new Databases(this.client);
  storage: Storage = new Storage(this.client);
  user: User = {} as User;

  constructor() {
    this.client
      .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT || "")
      .setProject(process.env.NEXT_PUBLIC_PROJECTID || "");
  }

  async googleLogin() {
    try {
      await this.account.createOAuth2Session(
        "google",
        `${process.env.NEXT_PUBLIC_APPURL}/landing`,
        `${process.env.NEXT_PUBLIC_APPURL}/login`
      );
      this.getCurUser();
      console.log(this.user);
    } catch (error) {
      console.error("Google login error:", error);
    }
  }

  async githubLogin() {
    try {
      await this.account.createOAuth2Session(
        "github",
        `${process.env.NEXT_PUBLIC_APPURL}/login/success`,
        `${process.env.NEXT_PUBLIC_APPURL}/login/failure`
      );
      this.getCurUser();
    } catch (error) {
      console.error("GitHub login error:", error);
    }
  }

  async getCurUser() {
    try {
      const user = await this.account.get();
      this.user = user;
      localStorage.setItem("userInfo", JSON.stringify(this.user));
      console.log(this.user);
    } catch (error) {
      console.error("Error getting current user:", error);
    }
  }

  async emailSignUp(name: string, email: string, password: string) {
    try {
      await this.account.create(ID.unique(), email, password, name);
    } catch (error) {
      console.error("Error signing up:", error);
    }
  }

  async emailLogin(email: string, password: string): Promise<Models.Session> {
    return this.account.createEmailSession(email, password);
  }

  async signOut(id: string): Promise<boolean> {
    try {
      await this.account.deleteSession(id);
      return true;
    } catch (error) {
      console.error("Error signing out:", error);
      return false;
    }
  }

  magicUrlLogin(email: string): void {
    this.account.createMagicURLSession(
      ID.unique(),
      email,
      `${process.env.NEXT_PUBLIC_APPURL}/login/sucess`
    );
    this.getCurUser();
  }

  // async createEvent(eventData: any, sponsors: Sponsor[], banner: File,): Promise<string> {
  //   try {
  //     const bannerResponse = await this.storage.createFile(this.bannerBucketId, ID.unique(), banner);
  //     const eventResponse = await this.databases.createDocument(this.databaseId, this.activeCollId, ID.unique(), {
  //       ...eventData,
  //       url: `${process.env.NEXT_PUBLIC_ENDPOINT}/v1/storage/buckets/${this.bannerBucketId}/files/${bannerResponse.$id}/view?project=${process.env.NEXT_PUBLIC_PROJECTID}&mode=admin`,
  //       created: JSON.parse(localStorage.getItem("userInfo") || "{}").$id,
  //       registrations: [],
  //     });
      
  //     const serverConfig = new ServerConfig();
  //     await serverConfig.createRegColl(eventResponse.$id, eventData.eventname);
  //     await serverConfig.createSponColl(eventResponse.$id, eventData.eventname, sponsors, JSON.parse(localStorage.getItem("userInfo") || "{}").$id);
      
  //     return "success";
  //   } catch (error) {
  //     console.error("Error creating event:", error);
  //     throw error;
  //   }
  // }

  async createEvent(
    eventname: string,
    description: string,
    banner: File,
    hostname: string,
    eventdate: string,
    email: string,
    country: string,
    address: string,
    city: string,
    state: string,
    postal: string,
    audience: string,
    type: string,
    attendees: number,
    price: number,
    tech: string,
    agenda: string,
    sponsor: Sponsor[],
    approval: string,
    twitter: string,
    website: string,
    linkedin: string,
    instagram: string
  ): Promise<String> {
    try {
      const fileRes = await this.storage.createFile(this.bannerBucketId, ID.unique(), banner);
      
      const docRes = await this.databases.createDocument(
         this.databaseId, this.activeCollId, ID.unique(), 
         {
            eventname: eventname,
            description: description,
            url: `${process.env.NEXT_PUBLIC_ENDPOINT}/storage/buckets/${this.bannerBucketId}/files/${fileRes.$id}/view?project=${process.env.NEXT_PUBLIC_PROJECTID}&mode=admin`,
            hostname: hostname,
            eventdate: eventdate,
            email: email,
            country: country,
            address: address,
            city: city,
            state: state,
            postal: postal,
            audience: audience,
            type: type,
            attendees: attendees,
            price: price,
            tech: tech,
            agenda: agenda,
            approval: approval,
            created: JSON.parse(localStorage.getItem("userInfo") || "{}").$id,
            twitter: twitter,
            website: website,
            linkedin: linkedin,
            instagram: instagram,
            registrations: [],
         }
      );
   
      const serverConfig = new ServerConfig();
      await serverConfig.createRegColl(`reg_${docRes.$id}`, eventname);
      await serverConfig.createSponColl( `spon_${docRes.$id}`, eventname, sponsor, JSON.parse(localStorage.getItem("userInfo") || "{}").$id);
   
      return "success";
   } catch (error) {
      console.error("Error creating event:", error);
      return "failed";
   }
   
    return Promise.resolve("sucess");
  }
}

export { AppwriteConfig, ServerConfig };
