"use client";
import IconHome from "@/components/icon/icon-home";
import Image from "next/image";
import React, { useState } from "react";
import { AddOrganizationForm } from "./AddOrganizationForm";
import IconMapPin from "@/components/icon/icon-map-pin";
import { OrgOfficeTab } from "./OrgOfficeTab";
import { OfficeResponse } from "@/lib/client";
import { getTranslation } from "@/i18n";

interface Props {
  offices: OfficeResponse[];
}
const OrganizationTabs = ({ offices }: Props) => {
  const [tabs, setTabs] = useState<string>("preferences");
  const toggleTabs = (name: string) => {
    setTabs(name);
  };

  const { t } = getTranslation();
  return (
    <div className="pt-5">
      <div className="mb-5 flex items-center justify-between">
        <h5 className="text-lg font-semibold dark:text-white-light">WAGUE ORG</h5>
      </div>
      <div>
        <ul className="mb-5 overflow-y-auto whitespace-nowrap border-b border-[#ebedf2] font-semibold dark:border-[#191e3a] sm:flex">
          <li className="inline-block">
            <button
              onClick={() => toggleTabs("preferences")}
              className={`flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${
                tabs === "preferences" ? "!border-primary text-primary" : ""
              }`}
            >
              <IconMapPin className="h-5 w-5" />
              {t("offices")}
            </button>
          </li>
          <li className="inline-block">
            <button
              onClick={() => toggleTabs("home")}
              className={`flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${
                tabs === "home" ? "!border-primary text-primary" : ""
              }`}
            >
              <IconHome />
              {t("home")}
            </button>
          </li>
        </ul>
      </div>
      {tabs === "preferences" ? (
        <div className="rounded-md border border-[#ebedf2] bg-white p-4 dark:border-[#191e3a] dark:bg-black">
          <OrgOfficeTab offices={offices} />
          <AddOrganizationForm />
        </div>
      ) : (
        ""
      )}
      {tabs === "home" ? (
        <div>
          <form className="mb-5 rounded-md border border-[#ebedf2] bg-white p-4 dark:border-[#191e3a] dark:bg-black">
            <h6 className="mb-5 text-lg font-bold">{t("general_information")}</h6>
            <div className="flex flex-col sm:flex-row">
              <div className="mb-5 w-full sm:w-2/12 ltr:sm:mr-4 rtl:sm:ml-4">
                <Image
                  height={46}
                  width={56}
                  src="/assets/images/logo.svg"
                  alt="img"
                  className="mx-auto h-20 w-20 rounded-full object-cover md:h-32 md:w-32"
                />
              </div>
              <div className="grid flex-1 grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name">Full Name</label>
                  <input id="name" type="text" placeholder="Jimmy Turner" className="form-input" />
                </div>
                <div>
                  <label htmlFor="profession">Profession</label>
                  <input id="profession" type="text" placeholder="Web Developer" className="form-input" />
                </div>
                <div>
                  <label htmlFor="country">Country</label>
                  <select
                    id="country"
                    className="form-select text-white-dark"
                    name="country"
                    defaultValue="United States"
                  >
                    <option value="All Countries">All Countries</option>
                    <option value="United States">United States</option>
                    <option value="India">India</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="address">Address</label>
                  <input id="address" type="text" placeholder="New York" className="form-input" />
                </div>
                <div>
                  <label htmlFor="location">Location</label>
                  <input id="location" type="text" placeholder="Location" className="form-input" />
                </div>
                <div>
                  <label htmlFor="phone">Phone</label>
                  <input id="phone" type="text" placeholder="+1 (530) 555-12121" className="form-input" />
                </div>
                <div>
                  <label htmlFor="email">Email</label>
                  <input id="email" type="email" placeholder="Jimmy@gmail.com" className="form-input" />
                </div>
                <div>
                  <label htmlFor="web">Website</label>
                  <input id="web" type="text" placeholder="Enter URL" className="form-input" />
                </div>
                <div>
                  <label className="inline-flex cursor-pointer">
                    <input type="checkbox" className="form-checkbox" />
                    <span className="relative text-white-dark checked:bg-none">Make this my default address</span>
                  </label>
                </div>
                <div className="mt-3 sm:col-span-2">
                  <button type="button" className="btn btn-primary">
                    Save
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default OrganizationTabs;
