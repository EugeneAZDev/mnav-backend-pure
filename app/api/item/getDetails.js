({
  method: async ({ clientId, itemIds, full = false }) => {
    const updateDetailsBySchedule = async () => {
      let updateDetails = false;
      if (!common.userStatusMap.get(clientId)) {
        const { body: statusBody } = await api.user
          .getStatus()
          .method({ clientId });
        const { status: userStatus } = statusBody;
        common.userStatusMap.set(clientId, userStatus);
      }
      const userSettings = common.userStatusMap.get(clientId);

      if (!userSettings.updatedDetailsAt) {
        updateDetails = true;
      } else {
        if (!userSettings.premium) {
          const scheduledAt = userSettings.updatedDetailsAt;
          // scheduledAt.setMonth(scheduledAt.getMonth() + 1);
          scheduledAt.setDate(scheduledAt.getDate() + 7);
          const now = await domain.getLocalTime(clientId);
          if (scheduledAt.getTime() - now.getTime() <= 0) updateDetails = true;
        }
        if (userSettings.premium && userSettings.autoDetailsUpdate)
          updateDetails = true;
      }
      if (updateDetails)
        await db.processTransaction(domain.user.updateDetails, clientId);
    };

    try {
      await updateDetailsBySchedule();
      const fields = !full ? ['id', 'itemId', 'latestAt', 'title'] : undefined;
      if (itemIds && itemIds.length > 0) {
        const result = await crud('ValueDetail').select({
          fields,
          where: { itemId: itemIds },
          orderBy: {
            fields: ['latestAt'],
            order: 'DESC',
          },
        });
        if (result.rows.length > 0) {
          return responseType.modifiedBodyTemplate(responseType.success, {
            detailsList: result.rows,
          });
        }
      }
      return responseType.modifiedBodyTemplate(responseType.success, {
        detailsList: undefined,
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
