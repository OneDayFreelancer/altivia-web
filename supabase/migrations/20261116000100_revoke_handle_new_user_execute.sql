-- El trigger corre como owner; la función no debe ser invocable por RPC.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
