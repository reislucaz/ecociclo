import prisma from "@/lib/db/db"; // Certifique-se de que isso está configurado corretamente

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const pontoId = parseInt(params.id);

  if (isNaN(pontoId)) {
    return Response.json(
      { error: "ID do ponto de coleta inválido." },
      { status: 400 }
    );
  }

  try {
    // Consulta os itens do ponto que ainda não foram coletados
    const itens = await prisma.pontoColetaItem.findMany({
      where: {
        pontoColetaId: pontoId,
        coletado: false,
      },
      include: {
        categoria: true, // Inclui detalhes da categoria
      },
    });

    return Response.json(itens);
  } catch (error) {
    console.error("Erro ao buscar itens do ponto de coleta:", error);
    return Response.json(
      { error: "Erro ao buscar itens do ponto de coleta." },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const pontoId = parseInt(params.id);

  if (isNaN(pontoId)) {
    return Response.json(
      { error: "ID do ponto de coleta inválido." },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const { categoriaId } = body;

    if (!categoriaId) {
      return Response.json(
        { error: "Categoria é obrigatória." },
        { status: 400 }
      );
    }

    // Verifica se o ponto de coleta existe
    const pontoExists = await prisma.pontoColeta.findUnique({
      where: { id: pontoId },
    });

    if (!pontoExists) {
      return Response.json(
        { error: "Ponto de coleta não encontrado." },
        { status: 404 }
      );
    }

    // Cria o novo item
    const novoItem = await prisma.pontoColetaItem.create({
      data: {
        pontoColetaId: pontoId,
        categoriaId: parseInt(categoriaId),
        coletado: false, // Padrão como não coletado
        autorId: pontoExists.authorId, // Associa o autor do ponto de coleta como autor do item
      },
    });

    await prisma.user.update({
      where: { id: pontoExists.authorId },
      data: {
        score: {
          increment: 10,
        },
      },
    });

    return Response.json(novoItem, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar item:", error);
    return Response.json({ error: "Erro ao criar item." }, { status: 500 });
  }
}