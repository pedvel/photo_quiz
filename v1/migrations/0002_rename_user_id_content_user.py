# Generated by Django 5.0.1 on 2024-09-30 23:31

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('v1', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='content',
            old_name='user_id',
            new_name='user',
        ),
    ]
