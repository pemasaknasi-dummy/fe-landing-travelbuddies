import React, { useEffect, useMemo, useState } from "react";
import { X, User, Phone, CreditCard, Calendar, Upload, CalendarIcon, CircleX, Trash, Trash2, VenusAndMars } from "lucide-react";
import { IProfileUpdate, ProfileUser } from "@/features/profile/api/profile-api";
import { SubmitHandler, useForm } from "react-hook-form";
import { useProfileQuery, useUpdateProfile } from "@/features/profile/hooks/useProfile";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { DayPicker } from "react-day-picker";
import Image from "next/image";
import { getUser } from "@/lib/session";

interface Props {
  onClose: () => void;
}

export const ModalUpdateProfile = ({ onClose }: Props) => {
  const updateProfileMutation = useUpdateProfile();
  const authUser = useMemo(() => getUser(), []);
  const [photoPreview, setPhotoPreview] = useState<string | null>(authUser.photo || null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(authUser.dateOfBirth ? new Date(authUser.dateOfBirth) : undefined);
  const [month, setMonth] = useState<Date>(new Date());
  const [isUpdateLoading, setIsUpdateLoading] = useState<boolean>(false);

  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
    reset,
  } = useForm<IProfileUpdate>();

  useEffect(() => {
    if (authUser) {
      reset({
        name: authUser.name ?? null,
        phone: authUser.phone ?? null,
        noKtp: authUser.noKtp ?? null,
        gender: authUser.gender ?? null,
        dateOfBirth: authUser.dateOfBirth ? dayjs(authUser.dateOfBirth).format("DD MMM YYYY") : null,
        photo: authUser.photo ?? null,
      });

      setPhotoPreview(authUser.photo ?? null);
    }
  }, [authUser, reset]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      setPhotoFile(file);
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPhotoPreview(base64String);
        setValue("photo", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit: SubmitHandler<IProfileUpdate> = async (formData) => {
    let uploadedImageUrl: string | undefined;
    if (photoFile) {
      const formData = new FormData();
      formData.append("file", photoFile);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload image failed");
      }

      const result = await response.json();
      uploadedImageUrl = result.url;
    }

    const payload = {
      ...formData,
      ...(uploadedImageUrl && { photo: uploadedImageUrl }),
      dateOfBirth: dateOfBirth,
    };

    setIsUpdateLoading(true);
    await updateProfileMutation.mutateAsync(payload, {
      onSuccess: () => {
        toast.success("Perubahan berhasil disimpan", {
          position: "top-center",
        });
        setTimeout(() => {
          setIsUpdateLoading(false);
          onClose();
        }, 1500);
      },
      onError: (error: any) => {
        console.log("update profile error: ", error);
        toast.error(`Gagal update profile.`, {
          position: "top-center",
        });
        setIsUpdateLoading(false);
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 bg-opacity-50 transition-opacity" />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl transform transition-all max-h-[90vh] overflow-y-auto scrollbar-hide">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-400 sticky top-0 bg-white rounded-t-2xl z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Update Profile</h2>
                <p className="text-sm text-gray-600">Perbarui informasi profil Anda</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
              disabled={updateProfileMutation.isPending}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit(onSubmit)} className="relative">
            <fieldset disabled={updateProfileMutation.isPending || isUpdateLoading}>
              <div className="space-y-4 p-6">
                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Foto Profil</label>
                  <div className="flex items-center gap-4">
                    {/* PREVIEW PHOTO */}
                    <div className="relative w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                      {photoPreview ? (
                        <Image src={photoPreview} alt="Preview" fill className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-10 h-10 text-gray-400" />
                      )}
                    </div>

                    {/* INPUT FILE IMAGE */}
                    <label className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
                        <Upload className="w-5 h-5 text-gray-500" />
                        <span className="text-sm text-gray-600">Pilih Foto</span>
                      </div>
                      <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                    </label>

                    {/* DELETE Photo Profile */}
                    {/* <button type="button" className="p-2 bg-red-500 rounded-lg cursor-pointer text-white hover:bg-red-700 tra">
                    <Trash2 />
                  </button> */}
                  </div>
                  {errors.photo && <p className="mt-1 text-sm text-red-600">{errors.photo.message}</p>}
                </div>

                {/* Name Input */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      className={`block w-full pl-10 pr-3 py-3 border ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                      placeholder="Masukkan nama lengkap"
                      {...register("name", {
                        required: {
                          value: true,
                          message: "Nama wajib diisi",
                        },
                      })}
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                </div>

                {/* Phone Input */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Telepon
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      className={`block w-full pl-10 pr-3 py-3 border ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                      placeholder="08xxxxxxxxxx"
                      {...register("phone", {
                        pattern: {
                          value: /^[0-9]+$/,
                          message: "Nomor telepon hanya boleh berisi angka",
                        },
                      })}
                      onInput={(e) => {
                        e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "");
                      }}
                    />
                  </div>
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
                </div>

                {/* KTP Input */}
                <div>
                  <label htmlFor="noKtp" className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor KTP
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CreditCard className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="noKtp"
                      type="text"
                      maxLength={16}
                      className={`block w-full pl-10 pr-3 py-3 border ${
                        errors.noKtp ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                      placeholder="16 digit nomor KTP"
                      {...register("noKtp", {
                        pattern: {
                          value: /^[0-9]+$/,
                          message: "Nomor KTP hanya boleh berisi angka",
                        },
                        minLength: { value: 16, message: "Nomor KTP harus 16 digit" },
                        maxLength: { value: 16, message: "Nomor KTP harus 16 digit" },
                      })}
                      onInput={(e) => {
                        e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "");
                      }}
                    />
                  </div>
                  {errors.noKtp && <p className="mt-1 text-sm text-red-600">{errors.noKtp.message}</p>}
                </div>

                {/* Gender  */}
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-medium">Jenis Kelamin</label>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <VenusAndMars className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      className={` block w-full pl-10 pr-3 py-3 border ${
                        errors.gender ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                      {...register("gender")}
                    >
                      <option value="" disabled hidden>
                        Pilih jenis kelamin
                      </option>
                      <option value="Male">Laki-laki</option>
                      <option value="Female">Perempuan</option>
                    </select>
                  </div>
                </div>

                {/* Date of Birth Input */}
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-medium">Tanggal Lahir</label>

                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="bg-gray-50 flex items-center gap-2 rounded-[8px] p-3 text-[14px] border border-gray-300 cursor-pointer hover:border-blue-400 transition">
                        <CalendarIcon className="text-gray-300" />

                        <span className={`${dateOfBirth ? "text-black" : "text-[#9A9A9A]"}`}>
                          {dateOfBirth ? dayjs(dateOfBirth).format("DD MMM YYYY") : "DD MMM YYYY"}
                        </span>
                      </div>
                    </PopoverTrigger>

                    <PopoverContent align="start" side="bottom" className="bg-white rounded-lg shadow-lg p-3 z-50">
                      <DayPicker
                        mode="single"
                        selected={dateOfBirth}
                        onSelect={(date) => {
                          setDateOfBirth(date);
                          if (date) setMonth(date);
                        }}
                        month={month}
                        onMonthChange={setMonth}
                        fromYear={1950}
                        toYear={new Date().getFullYear()}
                        captionLayout="dropdown"
                        disabled={(date) => date > new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="sticky bottom-0 p-5 bg-white border-t border-gray-400 grid grid-cols-3 gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={updateProfileMutation.isPending}
                  className=" text-sm col-span-1 shadow-lg shadow-gray-400 py-2 rounded-lg font-semibold hover:ring-2 bg-red-500 text-white hover:text-red-500 hover:bg-white hover:outline-none hover:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="text-sm col-span-2 text-white py-2 bg-blue-500 hover:ring-2 hover:outline-none hover:bg-white hover:ring-blue-500 hover:text-blue-500 cursor-pointer rounded-lg font-semibold transition-all duration-300 shadow-lg shadow-gray-400 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:hover:text-white disabled:hover:ring-0"
                >
                  {updateProfileMutation.isPending || isUpdateLoading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </fieldset>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalUpdateProfile;
