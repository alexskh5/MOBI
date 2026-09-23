import { Pencil, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import CenterLayout from "../../../layouts/CenterLayout";
import centerLogo from "../../../assets/centerLogo.png";
import coverPhoto from "../../../assets/coverPhoto.png";
import {
  getCenterProfile,
  updateCenterProfile,
  type CenterProfile as CenterProfileData,
} from "../../../services/centerProfileApi";

const emptyProfile: CenterProfileData = {
  id: "",
  centerName: "",
  centerEmail: "",
  centerPhone: "",
  centerWebsite: "",
  centerOwnerName: "",
  centerOwnerPhone: "",
  centerOwnerEmail: "",
  contactPersonName: "",
  contactPersonPhone: "",
  contactPersonEmail: "",
  address: "",
  city: "",
  province: "",
  postalCode: "",
  about: "",
  subscriptionStatus: "No active plan",
  isActive: false,
};

const fieldClass =
  "w-full rounded-xl border border-white/70 bg-white px-4 py-3 outline-none focus:border-[#B47AC4]";

const labelClass = "block font-semibold mb-2";

const CenterProfile = () => {
  const navigate = useNavigate();

  const [profile, setProfile] =
    useState<CenterProfileData>(emptyProfile);
  const [draft, setDraft] =
    useState<CenterProfileData>(emptyProfile);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const loadedProfile = await getCenterProfile();

        if (!isMounted) return;

        setProfile(loadedProfile);
        setDraft(loadedProfile);
      } catch (loadError: any) {
        if (isMounted) {
          setError(
            loadError?.response?.data?.message ||
              loadError?.message ||
              "Unable to load center profile.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateDraft = (
    key: keyof CenterProfileData,
    value: string,
  ) => {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleCancel = () => {
    setDraft(profile);
    setEditing(false);
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const savedProfile = await updateCenterProfile({
        centerName: draft.centerName,
        centerEmail: draft.centerEmail,
        centerPhone: draft.centerPhone,
        centerWebsite: draft.centerWebsite,
        centerOwnerName: draft.centerOwnerName,
        centerOwnerPhone: draft.centerOwnerPhone,
        centerOwnerEmail: draft.centerOwnerEmail,
        contactPersonName: draft.contactPersonName,
        contactPersonPhone: draft.contactPersonPhone,
        contactPersonEmail: draft.contactPersonEmail,
        address: draft.address,
        city: draft.city,
        province: draft.province,
        postalCode: draft.postalCode,
        about: draft.about,
      });

      setProfile(savedProfile);
      setDraft(savedProfile);
      setEditing(false);
      setSuccess("Center profile updated.");
    } catch (saveError: any) {
      setError(
        saveError?.response?.data?.message ||
          saveError?.message ||
          "Unable to save center profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  const fullAddress = [
    profile.address,
    profile.city,
    profile.province,
    profile.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <CenterLayout>
      {(sidebarOpen, setSidebarOpen) => (
        <div className="bg-[#E4C9E5]/80 h-full rounded-[30px] inter overflow-hidden">
          <div className="relative h-72 w-full">
            {!sidebarOpen && (
              <button
                className="absolute top-8 left-8 text-3xl z-50 mt-2"
                onClick={() => setSidebarOpen(true)}
              >
                ☰
              </button>
            )}

            <img
              src={coverPhoto}
              alt="Cover"
              className="w-full h-full object-cover opacity-25"
            />
          </div>

          <div className="px-14 pb-10">
            <div className="flex flex-wrap justify-between gap-6 items-start">
              <div className="flex gap-6 flex-1 min-w-[420px]">
                <div className="relative -mt-24">
                  <div className="w-48 h-48 bg-white rounded-2xl shadow border overflow-hidden">
                    <img
                      src={centerLogo}
                      alt="Center Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="pt-4 flex-1 min-w-0">
                  <h1 className="text-3xl font-bold">
                    {loading
                      ? "Loading center..."
                      : profile.centerName || "Unnamed Center"}
                  </h1>

                  <p className="text-xl mt-1">
                    {fullAddress || "No center address added yet"}
                  </p>

                  <div className="flex gap-3 mt-4 text-sm">
                    <span className="bg-white px-4 py-2 rounded-xl shadow">
                      {profile.isActive ? "Active" : "Suspended"}
                    </span>
                    <span className="bg-white px-4 py-2 rounded-xl shadow">
                      {profile.subscriptionStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-6">
                <button
                  onClick={() => navigate("/center/profile/doctors")}
                  className="bg-[#E0A9D4] px-6 py-2 rounded-xl shadow hover:bg-[#d899cb] transition duration-200"
                >
                  View Doctor List
                </button>

                <button
                  onClick={() => navigate("/center/profile/staff")}
                  className="bg-[#E0A9D4] px-6 py-2 rounded-xl shadow hover:bg-[#d899cb] transition duration-200"
                >
                  View Staff List
                </button>

                {!editing && (
                  <button
                    onClick={() => {
                      setEditing(true);
                      setSuccess("");
                    }}
                    className="bg-white px-5 py-2 rounded-xl shadow hover:bg-gray-100 transition duration-200 flex items-center gap-2"
                  >
                    <Pencil size={17} />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-6 bg-red-50 text-red-700 border border-red-100 rounded-xl px-4 py-3 font-semibold">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-6 bg-green-50 text-green-700 border border-green-100 rounded-xl px-4 py-3 font-semibold">
                {success}
              </div>
            )}

            <div className="grid grid-cols-2 gap-12 mt-10">
              <div className="space-y-6">
                <ProfileField
                  label="Center name"
                  value={draft.centerName}
                  editing={editing}
                  onChange={(value) => updateDraft("centerName", value)}
                />

                <ProfileField
                  label="Center email"
                  value={draft.centerEmail}
                  editing={editing}
                  onChange={(value) => updateDraft("centerEmail", value)}
                  type="email"
                />

                <ProfileField
                  label="Center phone"
                  value={draft.centerPhone}
                  editing={editing}
                  onChange={(value) => updateDraft("centerPhone", value)}
                />

                <ProfileField
                  label="Website"
                  value={draft.centerWebsite}
                  editing={editing}
                  onChange={(value) => updateDraft("centerWebsite", value)}
                />

                <ProfileTextArea
                  label="About"
                  value={draft.about}
                  editing={editing}
                  onChange={(value) => updateDraft("about", value)}
                />
              </div>

              <div className="space-y-6">
                <ProfileField
                  label="Center owner"
                  value={draft.centerOwnerName}
                  editing={editing}
                  onChange={(value) => updateDraft("centerOwnerName", value)}
                />

                <ProfileField
                  label="Owner phone"
                  value={draft.centerOwnerPhone}
                  editing={editing}
                  onChange={(value) => updateDraft("centerOwnerPhone", value)}
                />

                <ProfileField
                  label="Owner email"
                  value={draft.centerOwnerEmail}
                  editing={editing}
                  onChange={(value) => updateDraft("centerOwnerEmail", value)}
                  type="email"
                />

                <ProfileField
                  label="Contact person"
                  value={draft.contactPersonName}
                  editing={editing}
                  onChange={(value) => updateDraft("contactPersonName", value)}
                />

                <ProfileField
                  label="Contact number"
                  value={draft.contactPersonPhone}
                  editing={editing}
                  onChange={(value) => updateDraft("contactPersonPhone", value)}
                />

                <ProfileField
                  label="Contact email"
                  value={draft.contactPersonEmail}
                  editing={editing}
                  onChange={(value) => updateDraft("contactPersonEmail", value)}
                  type="email"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-5 mt-8">
              <ProfileField
                label="Address"
                value={draft.address}
                editing={editing}
                onChange={(value) => updateDraft("address", value)}
              />

              <ProfileField
                label="City"
                value={draft.city}
                editing={editing}
                onChange={(value) => updateDraft("city", value)}
              />

              <ProfileField
                label="Province"
                value={draft.province}
                editing={editing}
                onChange={(value) => updateDraft("province", value)}
              />

              <ProfileField
                label="Postal code"
                value={draft.postalCode}
                editing={editing}
                onChange={(value) => updateDraft("postalCode", value)}
              />
            </div>

            {editing && (
              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-white px-6 py-3 rounded-xl shadow hover:bg-gray-100"
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="bg-[#B47AC4] text-white px-6 py-3 rounded-xl shadow hover:bg-[#9D65AE] flex items-center gap-2 disabled:opacity-60"
                  disabled={saving}
                >
                  <Save size={18} />
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </CenterLayout>
  );
};

function ProfileField({
  label,
  value,
  editing,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {editing ? (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={fieldClass}
        />
      ) : (
        <div className="bg-white rounded-xl shadow px-4 py-3 min-h-[48px]">
          {value || "Not added yet"}
        </div>
      )}
    </div>
  );
}

function ProfileTextArea({
  label,
  value,
  editing,
  onChange,
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {editing ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={5}
          className={`${fieldClass} resize-none`}
        />
      ) : (
        <div className="bg-white rounded-xl shadow px-4 py-3 min-h-[132px] whitespace-pre-wrap">
          {value || "Not added yet"}
        </div>
      )}
    </div>
  );
}

export default CenterProfile;
