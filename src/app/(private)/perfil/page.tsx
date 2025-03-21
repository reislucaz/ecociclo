import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth/auth-options";
import prisma from "@/lib/db/db";
import { X } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { levels } from "@/lib/constants/levels";
import { Progress } from "@/components/ui/progress";
import EditProfileDialog from "@/components/routes/profile/edit-profile-dialog";
import SignOutButton from "@/components/sign-out";
import BaixarCertificado from "@/components/routes/profile/baixar-certificado";

export const dynamic = "force-dynamic";

export default async function Profile() {
  const session = await getServerSession(authOptions);

  const userOrNull = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      score: true,
      name: true,
      email: true,
      cpf: true,
      birthDate: true,
    },
  });

  if (!userOrNull) {
    throw new Error("Usuário não encontrado");
  }

  const getFirstAndLastName = (name: string) => {
    const [firstName, lastName] = name.split(" ");
    return `${firstName} ${lastName}`;
  };

  function getLevelAndNextLevelAndProgress(score: number) {
    let level = 1;
    let nextLevel = levels[level];
    let actualLevel = levels[level - 1];
    let progress = 0;

    while (score >= nextLevel.scoreRequired) {
      level++;
      nextLevel = levels[level];
      actualLevel = levels[level - 1];
    }

    if (level === 1) {
      progress = (score / nextLevel.scoreRequired) * 100;
    } else {
      const previousLevel = levels[level - 1];
      progress =
        ((score - previousLevel.scoreRequired) /
          (nextLevel.scoreRequired - previousLevel.scoreRequired)) *
        100;
    }

    return { actualLevel, nextLevel, progress };
  }

  const { actualLevel, nextLevel, progress } = getLevelAndNextLevelAndProgress(
    userOrNull.score
  );

  return (
    <div className="flex text-center  flex-col p-4 space-y-16 pb-32">
      <div className="flex w-full justify-center">
        <h1 className="font-bold">Perfil</h1>
        <Link href="/home">
          <X className="absolute left-4 font-light" />
        </Link>
      </div>
      <div className="flex flex-col items-start space-y-4">
        <div
          className="w-24 h-24 rounded-full bg-gray-200"
          style={{
            backgroundImage: "url('https://random.imagecdn.app/96/96')",
          }}
        ></div>
        <div className="flex flex-col items-start text-start">
          <h2 className="font-bold">{getFirstAndLastName(userOrNull.name)}</h2>
          <p className="font-light text-sm text-gray-400">{userOrNull.email}</p>
        </div>
        <EditProfileDialog
          user={{
            name: userOrNull.name,
            email: userOrNull.email,
            cpf: userOrNull.cpf,
          }}
        />
      </div>
      <div className="w-full flex flex-col items-start space-y-4">
        <h2 className="font-bold">score</h2>
        <div className="w-full flex flex-col items-start text-start space-y-2">
          <h2>
            Level {actualLevel.level}: {actualLevel.name}
          </h2>
          <Progress value={progress} className="w-full" />
          <p className="text-xs text-gray-400">
            {actualLevel.motivationalPhrase}
          </p>
        </div>
      </div>
      <BaixarCertificado />
      <SignOutButton />
    </div>
  );
}
